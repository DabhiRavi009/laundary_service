document.addEventListener("DOMContentLoaded", function () {
  const rightDiv = document.querySelector(".section-right1");
  const bookNowBtn = document.querySelector(".book-now");
  const cartItems = document.querySelector("tbody");
  const totalAmount = document.querySelector(".price-div h3");
  const counters = document.querySelectorAll(".counter");
  let total = 0;
  let itemIndex = 1;

  counters.forEach((counter) => {
    counter.textContent = "0+";

    const updateCounter = () => {
      const targetCount = +counter.getAttribute("data-target");
      let startingCount = Number(counter.textContent.replace("+", ""));

      const increment = Math.ceil(targetCount / 100);

      if (startingCount < targetCount) {
        startingCount += increment;
        counter.textContent = `${startingCount}+`;
        setTimeout(updateCounter, 2);
      } else {
        counter.textContent = `${targetCount}+`;
      }
    };
    updateCounter();
  });

  const setRightDivHeight = () => {
    rightDiv.style.height = rightDiv.offsetHeight > 230 ? "auto" : "230px";
  };

  const scrollDown = () => {
    const bookserviceBtn = document.getElementById("bookservice-today");
    if (bookserviceBtn) {
      bookserviceBtn.addEventListener("click", () => {
        const section3 = document.getElementById("section-3");
        if (section3) {
          section3.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  };

  const scrollSection = () => {
    const sections = [
      { buttonId: "home", sectionId: "section-1" },
      { buttonId: "about", sectionId: "section-4" },
      { buttonId: "service", sectionId: "section-3" },
      { buttonId: "contact", sectionId: "footer" },
    ];

    sections.forEach(({ buttonId, sectionId }) => {
      const button = document.getElementById(buttonId);
      const section = document.getElementById(sectionId);

      if (button && section) {
        button.addEventListener("click", () => {
          section.scrollIntoView({ behavior: "smooth" });
        });
      }
    });
  };

  const updateTotalAmount = (amount) => {
    total += amount;
    totalAmount.textContent = `₹${total.toFixed(2)}`;
  };

  const createCartItemRow = (service, price) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${itemIndex}</td>
        <td>${service}</td>
        <td>₹${price.toFixed(2)}</td>
      `;
    row.dataset.service = service;
    return row;
  };

  const handleAddItem = (button) => {
    const serviceContainer = button.closest(".service-container");
    const service = serviceContainer.querySelector("p").textContent.trim();
    const price = parseFloat(
      serviceContainer.querySelector("h4").textContent.replace("₹", "").trim()
    );

    const row = createCartItemRow(service, price);
    cartItems.appendChild(row);

    updateTotalAmount(price);
    itemIndex++;

    button.classList.remove("add");
    button.classList.add("remove");
    button.innerHTML = 'Remove Item <i class="fa-solid fa-circle-minus"></i>';
    button.removeEventListener("click", handleAddItemWrapper);
    button.addEventListener("click", handleRemoveItem);

    setRightDivHeight();
  };

  const handleRemoveItem = (event) => {
    const button = event.currentTarget;
    const serviceContainer = button.closest(".service-container");
    const service = serviceContainer.querySelector("p").textContent.trim();
    const price = parseFloat(
      serviceContainer.querySelector("h4").textContent.replace("₹", "").trim()
    );

    const rows = cartItems.querySelectorAll("tr");
    rows.forEach((row) => {
      if (row.dataset.service === service) {
        cartItems.removeChild(row);
      }
    });

    updateTotalAmount(-price);

    button.classList.remove("remove");
    button.classList.add("add");
    button.innerHTML = 'Add Item <i class="fa-solid fa-circle-plus"></i>';
    button.removeEventListener("click", handleRemoveItem);
    button.addEventListener("click", handleAddItemWrapper);

    setRightDivHeight();
  };

  const handleAddItemWrapper = (event) => {
    handleAddItem(event.currentTarget);
  };

  const addServiceEventListeners = () => {
    const addItemButtons = document.querySelectorAll(".add");
    addItemButtons.forEach((button) => {
      button.addEventListener("click", handleAddItemWrapper);
    });
  };

  const handleBookNowButtonClick = () => {
    const bookNowBtn = document.getElementById("book-now-btn");
    const errorMessage = document.querySelector(".error-para");

    if (bookNowBtn) {
      bookNowBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const tableRows = document.querySelectorAll(".table tbody tr");
        const fullNameInput = document.getElementById("full-name");
        const emailInput = document.getElementById("email");
        const phoneNumberInput = document.getElementById("phone-number");

        if (!fullNameInput || !emailInput || !phoneNumberInput) {
          console.error("One or more input fields are missing.");
          return;
        }

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const phoneNumber = phoneNumberInput.value.trim();

        let isValid = true;
        let validationMessage = "";

        if (fullName === "") {
          isValid = false;
          validationMessage += "Full Name is required.\n";
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          isValid = false;
          validationMessage += "Invalid Email format.\n";
        }

        const phonePattern = /^\d+$/;
        if (!phonePattern.test(phoneNumber) || phoneNumber === "") {
          isValid = false;
          validationMessage +=
            "Phone Number should only contain digits and should not be empty.\n";
        }

        if (tableRows.length === 0) {
          errorMessage.style.display = "block";
        } else {
          errorMessage.style.display = "none";
          if (!isValid) {
            console.log(validationMessage);
            alert(validationMessage);
            return;
          }

          let serviceDetails = "";
          let totalPrice = 0;

          tableRows.forEach((row) => {
            const serviceNameElement = row.querySelector("td:nth-child(2)");
            const priceElement = row.querySelector("td:nth-child(3)");

            if (serviceNameElement && priceElement) {
              const serviceName = serviceNameElement.textContent;
              const price = parseFloat(priceElement.textContent.substring(1));
              serviceDetails += `${serviceName}: ₹${price.toFixed(2)}\n`;
              totalPrice += price;
            } else {
              console.error(
                "Service name or price element not found in table row:",
                row
              );
            }
          });

          // Send booking details to the server to send the email
          try {
            const response = await fetch("http://localhost:8080/send-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fullName,
                email,
                phoneNumber,
                serviceDetails,
                totalPrice,
              }),
            });

            if (response.ok) {
              alert("Booking confirmed! A confirmation email has been sent.");
            } else {
              const errorText = await response.text();
              alert(`Failed to send confirmation email: ${errorText}`);
            }
          } catch (error) {
            console.error("Error sending email:", error);
            alert("An error occurred while sending the confirmation email.");
          }
        }
      });
    }
  };

  const init = () => {
    scrollDown();
    scrollSection();
    addServiceEventListeners();
    setRightDivHeight();
    handleBookNowButtonClick();
  };

  init();
});
