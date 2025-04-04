import { Link, useLoaderData } from "@remix-run/react"
import Card from "~/components/layout/Card"
import { GetAllProjects, Project } from "~/modules/projects/project.typedefs"
import headerImage from "../../public/children.jpg"
import cardImage from "../../public/africa.jpg"
import { ROUTES } from "~/utils/routes/routes.constants"
import { useReadContract } from "wagmi"
import config from "~/config/contract"

export default function ProjectLists() {
  const {
    data: projects,
    isPending,
    error,
    refetch,
  } = useReadContract({
    address: config.Chain4Good.address,
    abi: config.Chain4Good.abi,
    functionName: "getAllProjects",
    args: [BigInt(0), BigInt(100)],
  })
  console.log("ptojects")
  // return (
  //   <div>
  //     <Card
  //       title="All Projects"
  //       description=" Donate with Confidence, Control with Transparency — Your Impact, Your Decision!"
  //       className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 card-side mb-4 "
  //       imageUrl={headerImage}
  //       imageClassName="max-h-36"
  //     />
  //     <h2 className="bold text-lg font-bold">
  //       Explore <span className="text-accent">{projects.length} projects</span>
  //     </h2>
  //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
  //       {projects.map((project: GetAllProjects, index) => {
  //         return (
  //           <Link to={`${ROUTES.PROJECT}${project.projectId}`}>
  //             <Card
  //               title={project.title}
  //               description={project.description}
  //               key={index + project.title}
  //               imageUrl={cardImage}
  //               className="w-96"
  //               imageClassName="w-full h-[300px]"
  //             />
  //           </Link>
  //         )
  //       })}
  //     </div>
  //   </div>
  // )
}
