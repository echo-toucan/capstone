const getObj = pose => {
  let obj = {}
  for (let idx = 0; idx < pose.keypoints.length; idx++) {
    obj[pose.keypoints[idx].part] = {
      x: pose.keypoints[idx].position.x,
      y: pose.keypoints[idx].position.y,
      score: pose.keypoints[idx].score
    }
  }
  return obj
}

const leftKneeIsUp = pose => {
  if (
    (pose.leftKnee.y - pose.leftShoulder.y) /
      (pose.rightHip.y - pose.rightShoulder.y) <
      1.5 &&
    pose.leftKnee.score > 0.85
  ) {
    return true
  } else return false
}

const rightKneeIsUp = pose => {
  if (
    (pose.rightKnee.y - pose.rightShoulder.y) /
      (pose.leftHip.y - pose.leftShoulder.y) <
      1.5 &&
    pose.rightKnee.score > 0.85
  ) {
    return true
  } else return false
}

const rightWristIsPerpendicular = pose => {
  if (
    // console.log('right Elbow', pose.rightElbow.y, pose.rightElbow.score)
    // console.log('right Shoulder', pose.rightShoulder.y, pose.rightShoulder.score)
    // console.log('right Wrist', pose.rightWrist.y, pose.rightWrist.score)
    (pose.rightElbow.y / pose.rightShoulder.y > 0.95 ||
      pose.rightElbow.y / pose.rightShoulder.y < 1.05) &&
    pose.rightWrist.y < pose.rightElbow.y
  ) {
    console.log('right wrist was perpendicular')
    return true
  } else return false
}

const leftArmIsOut = pose => {
  if (
    Math.abs(pose.leftWrist.y - pose.leftShoulder.y) <
      0.25 * pose.leftShoulder.y &&
    Math.abs(pose.leftElbow.y - pose.leftShoulder.y) <
      0.25 * pose.leftShoulder.y
  ) {
    return true
  } else return false
}

const rightArmIsOut = pose => {
  if (
    Math.abs(pose.rightWrist.y - pose.rightShoulder.y) <
      0.25 * pose.rightShoulder.y &&
    Math.abs(pose.rightElbow.y - pose.rightShoulder.y) <
      0.25 * pose.rightShoulder.y
  ) {
    return true
  } else return false
}

const leftArmIsUp = pose => {
  if (
    (pose.leftShoulder.y - pose.leftWrist.y) /
      (pose.leftHip.y - pose.leftShoulder.y) >
    0.7
  ) {
    return true
  } else return false
}

const rightArmIsUp = pose => {
  if (
    (pose.rightShoulder.y - pose.rightWrist.y) /
      (pose.rightHip.y - pose.rightShoulder.y) >
    0.7
  ) {
    return true
  } else return false
}

const wristsAreTogether = pose => {
  if (
    1.25 * pose.leftShoulder.x - pose.rightShoulder.x >
    pose.leftWrist.x - pose.rightWrist.x
  ) {
    return true
  } else return false
}

const rightWristUpLeftWristDown = pose => {
  //right wrist is above shoulders and left wrist is under shoulder
  if (
    pose.rightWrist.y < pose.rightShoulder.y &&
    pose.leftWrist.y > pose.leftShoulder.y
    // 1.05 * pose.rightWrist.x > pose.rightShoulder.x &&
    // 1.05 * pose.leftWrist.x < pose.leftShoulder.x
  ) {
    return true
  } else {
    return false
  }
}

const leftWristUpRightWristDown = pose => {
  //left wrist is above shoulders and right wrist is under shoulder
  if (
    pose.rightWrist.y > pose.rightShoulder.y &&
    pose.leftWrist.y < pose.leftShoulder.y
    // 1.05 * pose.rightWrist.x > pose.rightShoulder.x &&
    // 1.05 * pose.leftWrist.x < pose.leftShoulder.x
  ) {
    return true
  } else {
    return false
  }
}

const wristsTogetherElbowTogether = pose => {
  const shoulderWidthX = pose.rightShoulder.x - pose.leftShoulder.x
  const wristToWristX = pose.rightWrist.x - pose.leftWrist.x
  if (
    // 1.25 * pose.leftShoulder.x - pose.rightShoulder.x >
    //   pose.leftWrist.x - pose.rightWrist.x &&
    shoulderWidthX > wristToWristX &&
    pose.rightWrist.y < pose.rightShoulder.y &&
    pose.leftWrist.y < pose.leftShoulder.y &&
    pose.leftElbow.y > pose.leftShoulder.y &&
    pose.rightElbow.y > pose.rightShoulder.y
  ) {
    return true
  } else return false
}

const isI = pose => {
  if (leftArmIsUp(pose) && rightArmIsUp(pose) && wristsAreTogether(pose))
    return 'I'
}

const isT = pose => {
  if (leftArmIsOut(pose) && rightArmIsOut(pose)) return 'T'
}

const isJ = pose => {
  if (leftArmIsOut(pose) && rightArmIsUp(pose)) return 'J'
}

const isL = pose => {
  if (rightArmIsOut(pose) && leftArmIsUp(pose)) return 'L'
}

const isS = pose => {
  if (leftWristUpRightWristDown(pose)) return 'S'
}

const isZ = pose => {
  if (rightWristUpLeftWristDown(pose)) return 'Z'
}

const isO = pose => {
  if (wristsTogetherElbowTogether(pose)) return 'O'
}

export const getShape = rawPose => {
  const pose = getObj(rawPose)
  if (
    (pose.leftHip.score < 0.9 && pose.rightHip.score < 0.9) ||
    pose.rightWrist.score < 0.7 ||
    pose.leftWrist.score < 0.7
  ) {
    return undefined
  }
  return (
    isI(pose) ||
    isT(pose) ||
    isJ(pose) ||
    isL(pose) ||
    isS(pose) ||
    isZ(pose) ||
    isO(pose)
  )
}

export const movementPose = pose => {
  let nosePose = Math.floor(pose.nose.x)
  let movement = []

  while (movement.length < 20) {
    movement.push(nosePose)
  }
  let moveReduce = movement.reduce((accu, curr) => {
    return (accu + curr) / movement.length * 10
  }, 0)

  if (moveReduce > 370 && moveReduce < 600) {
    return 'Move Left'
  }

  if (moveReduce > 50 && moveReduce < 270) {
    return 'Move Right'
  }
}

const getHitboxes = rotations => {
  const screenWidth = 640
  const buffer = screenWidth / 6
  const hitboxRanges = rotations.map((el, idx, arr) => {
    const segmentWidth = (screenWidth - 2 * buffer) / arr.length
    const boxEnd = screenWidth - buffer - idx * segmentWidth
    return [boxEnd - segmentWidth, boxEnd]
  })
  return hitboxRanges
}

const leftHandIsOnHitbox = (pose, range) => {
  const leftWristIsUp = pose.leftWrist.y < 150 && pose.leftWrist.score > 0.9
  const leftWristIsInRange =
    pose.leftWrist.x > range[0] && pose.leftWrist.x < range[1]
  if (leftWristIsUp && leftWristIsInRange) return true
  else return false
}

const rightHandIsOnHitbox = (pose, range) => {
  const rightWristIsUp = pose.rightWrist.y < 150 && pose.rightWrist.score > 0.9
  const rightWristIsInRange =
    pose.rightWrist.x > range[0] && pose.rightWrist.x < range[1]
  if (rightWristIsUp && rightWristIsInRange) return true
  else return false
}

export const checkRotation = (rawPose, rotations) => {
  const pose = getObj(rawPose)
  const ranges = getHitboxes(rotations)
  for (let i = 0; i < ranges.length; i++) {
    if (
      leftHandIsOnHitbox(pose, ranges[i]) ||
      rightHandIsOnHitbox(pose, ranges[i])
    ) {
      return i
    }
  }
  return undefined
}

export const checkPosition = rawPose => {
  const pose = getObj(rawPose)
  const nose = pose.nose.x
  const buffer = 150
  const screenWidth = 640
  const columnWidth = (screenWidth - buffer * 2) / 10
  if (nose <= buffer) return 9
  else if (nose >= screenWidth - buffer) return 0
  else return Math.ceil(9 - (nose - buffer) / columnWidth)
}

// Id	Part
// 0	nose
// 1	leftEye
// 2	rightEye
// 3	leftEar
// 4	rightEar
// 5	leftShoulder
// 6	rightShoulder
// 7	leftElbow
// 8	rightElbow
// 9	leftWrist
// 10	rightWrist
// 11	leftHip
// 12	rightHip
// 13	leftKnee
// 14	rightKnee
// 15	leftAnkle
// 16	rightAnkle
