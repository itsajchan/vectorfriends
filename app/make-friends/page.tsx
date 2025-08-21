"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    linkedInUrl: "",
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch(
        "/api/extract-linkedin-data",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(
                form
            )
        }
    );
    const data = await response.json();
    console.log(response.status)

    setLoading(false);
    if (response.status == 200) {
        setSuccess(true);
    } else {
        setError(true)
        console.log(data)
    }

    // Handle form submission here
  };

  return (
    <div className="flex flex-col min-h-screen min-w-full p-10 bg-gradient-radial from-yellow-200 via-sky-200 to-green-300 flex items-center justify-center">
        <div className="flex space-x-10">
            <Image src="/weaviate-logo.svg" width={200} height={200} alt={"Weaviate logo"}/>
            <Image src="/diffbot-logo.svg" width={200} height={200} alt={"Diffbot logo"}/>
            <Image src="/neo4j-logo.svg" width={200} height={200} alt={"Neo4j logo"}/>
        </div>
        <h1 className="text-center text-4xl mt-10 pb-10">
            Find My Hacker Friends
        </h1>
        { loading ? 
        
            <span className="loading loading-infinity loading-lg"></span>
        :
                
            <>
            { success ? <div>Alright, you&apos;re set! Return back to the presenter!</div> : 

                <>{error ? <div>Okay sorry, there&apos;s been an error. I&apos;m logging the error, if you can let me know what it is, that would be great!</div> :    

                    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                        <label>
                            First Name<br/>
                            <input type="text" placeholder="Jenna Doe" name="firstName"  className="input input-bordered w-full" onChange={handleChange}  />

                        </label>
                        <label>
                            Email Address<br/>
                            <input type="email" placeholder="favoritevectordb@weaviate.io" name="email"  className="input input-bordered w-full" onChange={handleChange}  />
                        </label>
                        <label>
                            LinkedIn URL<br/>
                            <input type="url" placeholder="https://linkedin.com/in/yourprofile" name="linkedInUrl"  className="input input-bordered w-full" onChange={handleChange}  />
                        </label>

                        <label>

                        <div className="flex space-x-2">

                            <input type="checkbox"  className="checkbox" name="agreeTerms" onChange={handleChange}  />
                            <div className="pb-1">
                                By clicking this checkbox, I agree to share my information with the presenter and other participants of this event. I understand that this information will be shared publicly and that I am responsible for the information I provide.
                            </div>
                        </div>

                        </label>
                        <button className="bg-yellow-100 rounded px-4 py-3 hover:bg-yellow-200 disabled:bg-gray-100 disabled:opacity-20" type="submit" disabled={!form.agreeTerms}>
                            Submit
                        </button>
                    </form>
                }
                </>
            }
            
            </>
        }
    </div>
  );
}