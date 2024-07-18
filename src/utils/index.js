const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

const GetAnswersFromArray = (answers, isChoices) => {
  const answersArray = [];
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (isChoices) {
      if (answer.choice !== null)
        answersArray.push({ question_id: answer.id, choice: answer.choice });
    } else {
      if (answer.text_answer !== null)
        answersArray.push({
          question_id: answer.id,
          text_answer: answer.text_answer,
        });
    }
  }

  return answersArray;
};

function calculatePercentage(X, Y) {
  return (X / Y) * 100;
}

const AutoCorrector = (answers, userAnswers) => {
  let totalOfCorrect = 1;
  let totalOfCorrectAnswers = 1;

  answers.forEach((answer, anIndex) => {
    if (answer.choice !== undefined) {
      totalOfCorrect++;
    }

    if (answer.text_answer !== undefined) {
      totalOfCorrect += answer.text_answer.length;
    }

    const question = userAnswers.find(
      (userAnswer) => userAnswer.question_id === answer.question_id
    );

    if (
      answer.choice !== undefined &&
      question &&
      answer.choice === question.choice &&
      answer.isRight === 1
    ) {
      totalOfCorrectAnswers++;
      question.isRight = true;
    }

    if (
      answer.text_answer !== undefined &&
      question &&
      question.text_answer !== undefined
    ) {
      question.text_answer.forEach((questionAnswer) => {
        const textAnswers = answer.text_answer.find(
          (textAnswer) => textAnswer === questionAnswer
        );
        if (textAnswers) {
          totalOfCorrectAnswers++;
          question.isRight = true;
        }
      });
    }
  });
  const percentage = calculatePercentage(totalOfCorrectAnswers, totalOfCorrect);
  return { percentage: percentage.toFixed(2), userAnswers };
};

module.exports = {
  shuffleArray,
  GetAnswersFromArray,
  AutoCorrector,
  calculatePercentage,
};
