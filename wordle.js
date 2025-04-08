const inputs = document.querySelectorAll(".letter-input");
const wordsFilePath = "words.txt";
const attemptsLeft = document.getElementById("attempts-left");

let words = new Set();
let selectedWord = "";

fetch("words.txt")
    .then(response => response.text())
    .then(text => {
        const tmp = text.split("\n").map(word => word.toUpperCase());
        words = new Set(tmp);
        console.log("Words loaded:", words);
        selectedWord = tmp[Math.floor(Math.random() * tmp.length)];
        console.log("Selected word:", selectedWord);
    })
    .catch(err => {
        console.error("Error loading words.txt:", err);
    });

let won = false;
let row = 1;

inputs[0].focus();
inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value.length > 1) {
            if (input.selectionStart === input.value.length)
                input.value = input.value.slice(-1);
            else
                input.value = input.value.slice(0, 1);
        }
        const val = input.value.toUpperCase();
        if (val.match(/[^A-Z]/)) {
            input.value = "";
            return;
        }
        input.style.fontWeight = "bold";
        input.value = val;

        if (val && index < 5 * row - 1 && inputs[index + 1])
            inputs[index + 1].focus();
    });
});

const handleSubmit = () => {
    if (attemptsLeft.innerText <= 0) {
        alert("Game over! You've used all attempts, the word was: " + selectedWord);
        return;
    }
    if (won) {
        alert("You already won! Please refresh the page to play again.");
        return;
    }

    const letters = [];
    inputs.forEach((input, index) => {
        if (index >= 5 * (row - 1) && index < 5 * row)
            letters.push(input.value.toUpperCase());
    });

    if (letters.includes("")) {
        alert("Please fill in all letters.");
        return;
    }

    const word = letters.join("");
    console.log("Submitted word:", word);

    if (!words.has(word)) {
        alert("This is not a valid word.");
        return;
    }
    
    let numberOfOccurrences = new Map();
    selectedWord.split("").forEach((letter) => {
        if (numberOfOccurrences.has(letter))
            numberOfOccurrences.set(letter, numberOfOccurrences.get(letter) + 1);
        else
            numberOfOccurrences.set(letter, 1);
    });
    let justInserted = [];
    inputs.forEach((input, index) => {
        if (index >= 5 * (row - 1) && index < 5 * row)
            justInserted.push(input);
    });
    justInserted.forEach((input, index) => {
        const letter = input.value;
        if (letter === selectedWord[index]) {
            input.style.color = "rgb(0, 175, 0)";
            input.style.backgroundColor = "rgb(193, 255, 193)";
            numberOfOccurrences.set(letter, numberOfOccurrences.get(letter) - 1);
        }
    });
    justInserted.forEach((input, index) => {
        const letter = input.value;
        if (letter != selectedWord[index] && selectedWord.includes(letter) && numberOfOccurrences.get(letter) > 0) {
            input.style.color = "rgb(255, 215, 0)";
            input.style.backgroundColor = "rgb(245, 255, 209)";
            numberOfOccurrences.set(letter, numberOfOccurrences.get(letter) - 1);
        }
    });

    if (word === selectedWord) {
        setTimeout(() => {
            won = true;
            alert("Congratulations! You won!");
            inputs.forEach((input, index) => {
                input.disabled = true;
            });
            return;
        }, 10);
    }

    row++;

    const attemptsLeftValue = parseInt(attemptsLeft.innerText);
    attemptsLeft.innerText = attemptsLeftValue - 1;
    
    if (attemptsLeftValue <= 1) {
        setTimeout(() => {
            alert("Game over! You've used all attempts, the word was: " + selectedWord);
            inputs.forEach((input, index) => {
                input.disabled = true;
            });
            return;
        }, 10);
    }

    // Enable the next row of inputs and disable the previous row
    inputs.forEach((input, index) => {
        if (index >= 5 * (row - 1) && index < 5 * row) {
            input.disabled = false;
            input.value = "";
        }
        if (index >= 5 * (row - 2) && index < 5 * (row - 1)) {
            input.disabled = true;
        }
    });
    const nextInputIndex = 5 * row - 5;
    if (inputs[nextInputIndex]) {
        inputs[nextInputIndex].focus();
    }
};

addEventListener("click", (e) => {
    if (e.target.id === "submit-button") {
        handleSubmit();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleSubmit();
    }
    if (e.key === "Backspace" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const focusedInput = document.querySelector(".letter-input:focus");
        if (focusedInput) {
            const index = Array.from(inputs).indexOf(focusedInput);
            if (e.key === "Backspace" && index > 0 && !inputs[index - 1].disabled)
            {
                inputs[index].value = "";
                setTimeout(() => {
                    inputs[index - 1].focus();
                }, 10);
            }
            if (e.key === "ArrowLeft" && index > 0 && !inputs[index - 1].disabled)
                inputs[index - 1].focus();
            if (e.key === "ArrowRight" && index < inputs.length - 1 && !inputs[index + 1].disabled)
                inputs[index + 1].focus();
        }
    }
});
