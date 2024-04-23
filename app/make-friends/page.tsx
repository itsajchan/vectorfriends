"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

  const [form, setForm] = useState({
    techStack: "",
    learnTech: "",
    openSource: "",
    email: "",
    firstName: "",
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
        "/api/submit-profile",
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
        <Image src="/weaviate-logo.svg" width={200} height={200} alt={"Weaviate logo"}/>
        <h1 className="text-center text-4xl mt-10 pb-10">
            Find My Vector Friends
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
{/* 
                        <div className="flex space-x-2">

                            <input type="checkbox"  className="checkbox" name="usingWeaviate" onChange={handleChange}  />
                            <div className="pb-1">
                                I'm using Weaviate for a project today!
                            </div>
                        </div>
                        <div className="flex space-x-2">

                            <input type="checkbox"  className="checkbox" name="usingWeaviate" onChange={handleChange}  />
                            <div className="pb-1">
                                I want to use Weaviate in a new project!
                            </div>
                        </div>
                        <div className="flex space-x-2">

                            <input type="checkbox"  className="checkbox" name="usingWeaviate" onChange={handleChange}  />
                            <div className="pb-1">
                                I want you to send me an email with the notes from this talk and more information about Weaviate!
                            </div>
                        </div> */}


                        <label>
                            What’s the technology stack that you’re most comfortable with?
                            <input type="text" placeholder="NextJS + Django + PostgreSQL etc" name="techStack"  className="input input-bordered w-full" onChange={handleChange}  />

                        </label>
                        <label>
                            What are some technologies you really want to learn at the moment?
                            <input type="text" placeholder="Machine Learning and Data Science!" name="learnTech" className="input input-bordered w-full" onChange={handleChange}  />
                        </label>
                        <label>
                            What is your favorite open source project and what does it do?
                            <input type="text" placeholder="Verba!" name="openSource" className="input input-bordered w-full" onChange={handleChange}  />
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