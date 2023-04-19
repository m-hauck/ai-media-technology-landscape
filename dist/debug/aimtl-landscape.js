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
        case "paymentModel":
          if (product.dataset.paymentModelUpdated != null) {
            convertCases(product, key);
            break;
          }
          const paymentModels = product.getAttribute("data-payment-model").split(",");
          product.dataset.paymentModel = PAYMENT_MODEL_TEXT[product.getAttribute("data-payment-model")];
          let paymentModelList = [];
          paymentModels.forEach((paymentModel) => {
            paymentModelList.push(PAYMENT_MODEL_TEXT[paymentModel]);
          });
          product.dataset.paymentModel = paymentModelList.join(", ");
          product.dataset.paymentModelUpdated = "true";
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

  // src/aimtl-landscape.ts
  var PAYMENT_MODEL_TEXT = {
    "free": "Free",
    "freemium": "Freemium",
    "paid-once": "Paid once",
    "paid-with-premium-extra": "Paid with premium extras",
    "paid-periodically": "Paid periodically",
    "contact-for-pricing": "Contact for Pricing"
  };
  function setEqualProductHeight() {
    const products = document.querySelectorAll(".product");
    let maxHeight = 0;
    products.forEach((item) => {
      const itemHeight = item.getBoundingClientRect().height;
      if (itemHeight > maxHeight) {
        maxHeight = itemHeight;
      }
    });
    products.forEach((item) => {
      item.style.minHeight = `${maxHeight}px`;
    });
  }
  function sortSubcategories(unsortedDict) {
    if (unsortedDict == null)
      return {};
    const sortedKeys = Object.keys(unsortedDict).sort();
    const sortedDict = {};
    sortedKeys.forEach((key) => {
      sortedDict[key] = unsortedDict[key];
    });
    return sortedDict;
  }
  function loadJson(path) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          return;
        }
        if (xhr.status !== 200) {
          reject();
        }
        resolve(JSON.parse(xhr.responseText));
      };
      xhr.open("GET", path, true);
      xhr.send();
    });
  }
  function getVisibleProducts(htmlSelector) {
    const VISIBLE_PRODUCTS = document.querySelectorAll(
      `${htmlSelector} .product:not([style*='display: none'])`
    );
    return VISIBLE_PRODUCTS.length.toString();
  }
  function setProductCounts(categories) {
    for (const [categoryKey] of Object.entries(categories)) {
      document.querySelector(
        `#${categoryKey} .count-product`
      ).innerText = getVisibleProducts(`#${categoryKey}`);
    }
    document.querySelector("#count-total").innerText = getVisibleProducts("#row-products");
  }
  function addProductsToCategories(categories, products) {
    products.forEach((product) => {
      const productCategories = product["categories"];
      productCategories.forEach((productCategory) => {
        const [mainCategory, subCategory] = productCategory.split("_");
        product["technologyReadinessLevelClass"] = product["technologyReadinessLevel"] == null ? "trl-unknown" : `trl-${product["technologyReadinessLevel"]}`;
        product["mediatypeClass"] = product["mediatype"].length > 1 ? "mediatype-mixed" : `mediatype-${product["mediatype"]}`;
        if (subCategory != null) {
          categories[mainCategory]["subcategories"][subCategory]["products"].push(product);
        } else {
          categories[mainCategory]["products"].push(product);
        }
        categories[mainCategory]["products"].sort((first, second) => {
          if (first.name < second.name) {
            return -1;
          } else if (first.name > second.name) {
            return 1;
          } else {
            return 0;
          }
        });
      });
    });
  }
  function addProductsToHtmlElement(products, htmlTarget, categories) {
    if (htmlTarget == null)
      return;
    const productsTemplate = document.querySelector("#product-template");
    products.forEach((product) => {
      let productClone = productsTemplate.content.cloneNode(
        true
      );
      const productListItem = productClone.querySelector("li");
      const productImage = productClone.querySelector("img");
      const productName = productClone.querySelector(".product-name");
      productListItem.classList.add(
        product["technologyReadinessLevelClass"],
        product["mediatypeClass"]
      );
      productImage.alt = product["name"];
      productImage.src = `img/${product["logo"]}`;
      productName.innerText = product["name"];
      if (product["productAvailable"] == "false") {
        productListItem.classList.add("product-unavailable");
      }
      product["paymentModel"].forEach((paymentModel) => {
        const paymentModelDiv = document.createElement("div");
        paymentModelDiv.classList.add("payment-model");
        paymentModelDiv.innerText = PAYMENT_MODEL_TEXT[paymentModel];
        productClone.querySelector(".product-content").appendChild(paymentModelDiv);
      });
      for (const [key, _] of Object.entries(product)) {
        if (!product.hasOwnProperty(key)) {
          continue;
        }
        productListItem.dataset[key] = product[key].toString();
      }
      htmlTarget.append(productClone);
    });
    let productElements = document.querySelectorAll(".product");
    productElements.forEach((element) => {
      element.addEventListener("click", (event) => {
        showModal(event.currentTarget, categories);
      });
    });
  }
  function addCategoriesAndProductsToPage(categories) {
    for (const [categoryKey] of Object.entries(categories)) {
      let html = `
        <div class="category" id="${categoryKey}">
            <h2 class="category-header">
                ${categories[categoryKey]["description"]} <span class="counter-text"><span class="count-product">0</span> products</span>
            </h2>
            <ul class="product-list" id="list-${categoryKey}"></ul>
        </div>`;
      document.querySelector("#row-products").innerHTML += html;
      addProductsToHtmlElement(
        categories[categoryKey]["products"],
        document.querySelector(`#${categoryKey} ul`),
        categories
      );
      const subcategories = categories[categoryKey]["subcategories"];
      const subcategoriesSorted = sortSubcategories(subcategories);
      for (const [subcategoryKey, subcategoryValue] of Object.entries(
        subcategoriesSorted
      )) {
        const subcategoryElement = document.createElement("div");
        subcategoryElement.classList.add(
          "subcategory",
          "card-subtitle",
          "mb-2",
          "text-muted"
        );
        subcategoryElement.id = subcategoryKey;
        document.querySelector(`#${categoryKey}`)?.appendChild(subcategoryElement);
        const subcategoryHeader = document.createElement("h3");
        subcategoryHeader.classList.add("subcategory-header");
        subcategoryHeader.innerText = subcategoryValue["description"];
        subcategoryElement.appendChild(subcategoryHeader);
        const subcategoryProductsList = document.createElement("ul");
        subcategoryProductsList.classList.add("product-list");
        subcategoryProductsList.id = subcategoryKey;
        document.querySelector(`#${subcategoryKey}`)?.appendChild(subcategoryProductsList);
        addProductsToHtmlElement(
          categories[categoryKey]["subcategories"][subcategoryKey]["products"],
          document.querySelector(`#${subcategoryKey} .product-list`),
          categories
        );
      }
    }
  }
  function toggleUnavailableProductsVisibility(categories) {
    const INPUT_SWITCH = document.querySelector(".switch input");
    const UNAVAILABLE_PRODUCTS = document.querySelectorAll(
      ".product-unavailable"
    );
    INPUT_SWITCH?.addEventListener("change", () => {
      let displayStyle = "";
      if (INPUT_SWITCH.checked) {
        displayStyle = "flex";
      } else {
        displayStyle = "none";
      }
      UNAVAILABLE_PRODUCTS.forEach((product) => {
        product.style.display = displayStyle;
      });
      setProductCounts(categories);
    });
  }
  console.clear();
  Promise.all([
    loadJson("data/categories.json"),
    loadJson("data/products.json")
  ]).then((values) => {
    const [categories, products] = values;
    if (categories == null || products == null) {
      return;
    }
    addProductsToCategories(categories, products);
    addCategoriesAndProductsToPage(categories);
    setProductCounts(categories);
    setEmptyModalFields();
    setEqualProductHeight();
    toggleUnavailableProductsVisibility(categories);
  });
})();
