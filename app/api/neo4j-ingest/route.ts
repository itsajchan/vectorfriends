import { NextRequest, NextResponse } from 'next/server';
import neo4j, { Driver, Session } from 'neo4j-driver';

// Initialize Neo4j driver
const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

const driver: Driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export async function POST(request: NextRequest) {
    try {
        const { data } = await request.json();
        
        if (!data) {
            return NextResponse.json(
                { error: 'No data provided' },
                { status: 400 }
            );
        }

        // Add print statement
        console.log("[Neo4j] data: ", data);

        const session: Session = driver.session();

        try {
            // Start a transaction
            const result = await session.executeWrite(async (tx) => {
                // Create or update the user
                const userResult = await tx.run(
                    `
                    MERGE (u:User { email: $email })
                    ON CREATE SET 
                        u.createdAt = datetime(),
                        u.fullName = $fullName,
                        u.linkedInUrl = $linkedInUrl,
                        u.image = $image,
                        u.description = $description
                    ON MATCH SET
                        u.updatedAt = datetime(),
                        u.fullName = COALESCE($fullName, u.fullName),
                        u.linkedInUrl = COALESCE($linkedInUrl, u.linkedInUrl),
                        u.image = COALESCE($image, u.image),
                        u.description = COALESCE($description, u.description)
                    RETURN u
                    `,
                    {
                        email: data.email,
                        fullName: data.fullName,
                        linkedInUrl: data.linkedInUri,
                        image: data.image,
                        description: data.description
                    }
                );

                // Handle skills
                if (data.skills && Array.isArray(data.skills)) {
                    for (const skill of data.skills) {
                        await tx.run(
                            `
                            MATCH (u:User { email: $email })
                            MERGE (s:Skill { name: $skillName })
                            MERGE (u)-[r:HAS_SKILL]->(s)
                            ON CREATE SET r.createdAt = datetime()
                            ON MATCH SET r.updatedAt = datetime()
                            `,
                            {
                                email: data.email,
                                skillName: skill.name
                            }
                        );
                    }
                }

                // Handle employments
                if (data.employments && Array.isArray(data.employments)) {
                    for (const employment of data.employments) {
                        if (employment.employer?.name) {
                            await tx.run(
                                `
                                MATCH (u:User { email: $email })
                                MERGE (c:Company { name: $companyName })
                                MERGE (u)-[r:WORKED_AT]->(c)
                                `,
                                {
                                    email: data.email,
                                    companyName: employment.employer.name,
                                }
                            );
                        }
                    }
                }

                return { success: true };
            });

            return NextResponse.json(
                { message: 'Data successfully ingested into Neo4j' },
                { status: 200 }
            );
        } finally {
            await session.close();
        }
    } catch (error) {
        console.error('Error ingesting data into Neo4j:', error);
        return NextResponse.json(
            { error: 'Failed to ingest data into Neo4j' },
            { status: 500 }
        );
    }
}

// Close the driver when the application shuts down
process.on('SIGTERM', async () => {
    await driver.close();
});

export const dynamic = 'force-dynamic'; // Ensure the route is dynamic