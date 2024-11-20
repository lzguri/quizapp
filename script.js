function checkAnswer(button, isCorrect) {
    const explanation = document.getElementById("explanation");
  
    if (isCorrect) {
      explanation.textContent = "Correct! Most factor deficiencies are autosomal recessive, but hemophilia A and B are X-linked disorders. This distinction is significant because X-linked conditions typically present with a family history involving males. In this case, the patient's mother reports a family history of a bleeding disorder, and notably, the affected individuals are male, which aligns with the inheritance pattern of X-linked disorders such as hemophilia";
      explanation.style.color = "green";
    } else {
      explanation.textContent = "Incorrect. Try again!";
      explanation.style.color = "red";
    }
  
    explanation.classList.remove("hidden");
  }
  