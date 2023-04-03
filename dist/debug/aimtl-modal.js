"use strict";
(() => {
  // src/aimtl-modal.ts
  var modal = document.querySelector("dialog");
  var modalCloseButton = document.querySelector("dialog #modal-close-button");
  var PRODUCT_KEY_NAMES = {
    name: "Name",
    manufacturer: "Company",
    logo: "Logo",
    link: "Link",
    mediatype: "Media type",
    description: "Description",
    technologyReadinessLevel: "Technology Readiness Level",
    aiTechnologiesUsed: "AI technologies used",
    categories: "Categories",
    paymentModel: "Payment Model",
    companyLocation: "Company headquarters",
    funding: "Funding",
    revenuePerYear: "Revenue",
    notes: "Notes"
  };
  function textListToTitleCase(text) {
    return text.split(",").map(
      (word) => word.trim().charAt(0).toUpperCase() + word.trim().slice(1)
    ).join(", ");
  }
  function textToTitleCase(text) {
    return text.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  function setEmptyModalFields() {
    const modalGrid = document.querySelector("#modal #modal-grid");
    for (const [key, name] of Object.entries(PRODUCT_KEY_NAMES)) {
      if (key == "logo") {
        continue;
      }
      const nameColumn = document.createElement("div");
      nameColumn.dataset[key + "Name"] = "";
      nameColumn.innerText = name;
      modalGrid?.appendChild(nameColumn);
      const contentColumn = document.createElement("div");
      contentColumn.dataset[key + "Content"] = "";
      modalGrid?.appendChild(contentColumn);
    }
  }
  function convertCases(product, key) {
    const kebabKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    modal.querySelector(`[data-${kebabKey}-content]`).innerText = product.getAttribute(`data-${kebabKey}`) || "";
    let display_style = "initial";
    if (product.getAttribute(`data-${kebabKey}`) == null || product.getAttribute(`data-${kebabKey}`) == "") {
      display_style = "none";
    }
    modal.querySelector(`[data-${kebabKey}-name]`).style.display = display_style;
    modal.querySelector(
      `[data-${kebabKey}-content]`
    ).style.display = display_style;
  }
  function showModal(product, categories) {
    if (product == null || !(product instanceof HTMLElement)) {
      return;
    }
    const modal2 = document.querySelector("#modal");
    for (const [key, _] of Object.entries(PRODUCT_KEY_NAMES)) {
      switch (key) {
        case "logo":
          modal2.querySelector(
            "[data-logo]"
          ).src = `img/${product.getAttribute("data-logo")}`;
          break;
        case "link":
          modal2.querySelector(
            "[data-link-content]"
          ).innerHTML = `<a href="${product.getAttribute(
            "data-link"
          )}" target="_blank" title="Open external link to '${product.getAttribute(
            "data-name"
          )}'">${product.getAttribute("data-link")}</a>`;
          break;
        case "mediatype":
          product.dataset.mediatype = textListToTitleCase(
            product.getAttribute("data-mediatype")
          );
          convertCases(product, key);
          break;
        case "technologyReadinessLevel":
          product.dataset.technologyReadinessLevel = textToTitleCase(
            product.getAttribute("data-technology-readiness-level")
          );
          convertCases(product, key);
          break;
        case "categories":
          if (product.dataset.categoriesUpdated != null) {
            convertCases(product, key);
            break;
          }
          const productCategories = product.getAttribute("data-categories").split(",");
          let productList = [];
          productCategories.forEach((productCategoryWithSubcategory) => {
            const [productCategory, productSubcategoryId] = productCategoryWithSubcategory.split("_");
            console.warn(categories[productCategory]["description"]);
            productList.push(
              categories[productCategory]["description"]
            );
            if (productSubcategoryId) {
              productList.push(
                categories[productCategory]["subcategories"][productSubcategoryId]["description"]
              );
            }
          });
          product.dataset.categories = productList.join(", ");
          product.dataset.categoriesUpdated = "true";
          convertCases(product, key);
          break;
        default:
          convertCases(product, key);
      }
    }
    modal2.showModal();
  }
  function closeModal(event) {
    if (event.target === modal || event.target instanceof HTMLElement && event.target.id === "modal-close-button") {
      modal.close();
    }
  }
  function setModalEventListeners() {
    modal.addEventListener("click", closeModal);
    modalCloseButton.addEventListener("click", closeModal);
  }
  setModalEventListeners();
})();
