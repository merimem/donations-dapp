import { ProjectStatus } from "@/modules/projects/project.typedefs"

export const timelineProps = (projectContract) => {
  const keys = Object.keys(ProjectStatus).filter((key) => isNaN(Number(key)))
  const projectStatus = projectContract?.status
  if (projectStatus === 0)
    return [
      {
        timelineStart: keys[0],
        isSelected: true,
        index: 0,
        totalItems: keys.length - 1,
      },
      {
        timelineStart: "Results",
        isSelected: false,
        index: 1,
        totalItems: keys.length - 1,
      },
      ...keys.slice(3).map((key, index) => {
        return {
          timelineStart: key,
          isSelected: false,
          index,
          totalItems: keys.length - 1,
        }
      }),
    ]
  if (projectStatus === 1)
    return [
      {
        timelineStart: keys[0],
        isSelected: true,
        index: 0,
        totalItems: keys.length - 1,
      },
      {
        timelineStart: keys[1],
        isSelected: true,
        index: 1,
        totalItems: keys.length - 1,
      },
      ...keys.slice(3).map((key, index) => {
        return {
          timelineStart: key,
          isSelected: false,
          index,
          totalItems: keys.length - 1,
        }
      }),
    ]
  if (projectStatus === 2)
    return [
      {
        timelineStart: keys[0],
        isSelected: true,
        index: 0,
        totalItems: keys.length - 1,
      },
      {
        timelineStart: keys[2],
        isSelected: true,
        index: 1,
        totalItems: keys.length - 1,
      },
      ...keys.slice(3).map((key, index) => {
        return {
          timelineStart: key,
          isSelected: false,
          index,
          totalItems: keys.length - 1,
        }
      }),
    ]
  if (projectStatus === 3 || projectStatus === 4)
    return [
      {
        timelineStart: keys[0],
        isSelected: true,
        index: 0,
        totalItems: keys.length - 1,
      },
      {
        timelineStart:
          projectContract &&
          projectContract?.yesVotes > projectContract?.noVotes
            ? keys[1]
            : keys[2],
        isSelected: true,
        index: 1,
        totalItems: keys.length - 1,
      },
      {
        timelineStart: keys[3],
        isSelected: true,
        index: 1,
        totalItems: keys.length - 1,
      },
      ...keys.slice(4).map((key, index) => {
        return {
          timelineStart: key,
          isSelected: false,
          index,
          totalItems: keys.length - 1,
        }
      }),
    ]
  return []
}
