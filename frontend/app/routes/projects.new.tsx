import { ActionFunction } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import Title from "~/components/layout/title"
import { PROJECT_STATUS } from "~/modules/projects/project.constants"
import { createProject } from "~/modules/projects/project.server"

export type ActionData = {
  success: boolean
  error: boolean
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    targetAmount: formData.get("targetAmount") as string,
    startDate: formData.get("startDate") as string,
    image: formData.get("image") as File,
  }
  try {
    console.log("data.image", data.image)
    const imageBlob = await data.image.arrayBuffer()
    const imageBuffer = Buffer.from(imageBlob)

    return createProject({
      project: {
        ...data,
        targetAmount: parseFloat(data.targetAmount),
        amountRaised: 0,
        status: PROJECT_STATUS.ACTIVE,
        image: imageBuffer,
      },
    }).then(() => {
      return Response.json({
        success: true,
        error: false,
      })
    })
  } catch (error) {
    console.log("error", error)
    return Response.json({
      success: false,
      error: true,
    })
  }
}
export const loader = async () => {
  return { address: null }
}

export default function Create() {
  const data = useActionData<ActionData>()
  return (
    <div>
      <Title type="h1">Create a new project</Title>

      <div className="hero min-h-screen">
        <Form method="post" className="w-full">
          <fieldset className="fieldset w-xs glass to-primary border border-base-300 p-4 rounded-box">
            <legend className="fieldset-legend">Add project</legend>

            <label className="fieldset-label" htmlFor="title">
              Title
            </label>
            <input type="text" name="title" className="input input-lg" />

            <label className="fieldset-label" htmlFor="title">
              Description
            </label>
            <textarea className="textarea textarea-xl" name="description" />

            <label className="fieldset-label" htmlFor="targetAmount">
              Target Amount ($)
            </label>
            <input
              type="number"
              className="input"
              name="targetAmount"
              min="1"
              placeholder="Should be above 100"
            />
            <p className="validator-hint">Should be above 100</p>
            <label className="fieldset-label" htmlFor="startDate">
              Date de début du projet
            </label>
            <input type="date" className="input" name="startDate" />
          </fieldset>
          <button className="btn btn-primary mt-4">Add project</button>
          {data?.error && <p className="text-secondary">There is an error !</p>}
          {data?.success && (
            <p className="text-accent">The project was created !</p>
          )}
        </Form>
      </div>
    </div>
  )
}
