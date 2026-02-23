
const getMockStudentData = (userName) => {
  return {
    name: userName,
    level: 15,
    totalScore: 22300,
    stats: {
      ordenamiento: {
        highScore: 12500,
        gamesPlayed: 42,
        accuracy: "92%",
        stars: 3,
      },
      escritura: {
        highScore: 9800,
        gamesPlayed: 35,
        accuracy: "88%",
        stars: 3,
      },
    },
  };
};


export const getStudentProfile = async (studentId) => {

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockStudentData(studentId));
    }, 100);
  });
};

export const getStudentGameStats = async (studentId) => {

  return getStudentProfile(studentId);
};