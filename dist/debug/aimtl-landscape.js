"use strict";
(() => {
  // src/aimtl-landscape.ts
  var PRODUCT_KEY_NAMES = {
    name: "Name",
    manufacturer: "Company",
    logo: "Logo",
    link: "Link",
    mediatype: "Media type",
    description: "Description",
    technologyReadinessLevel: "Technology Readiness Level (TRL)",
    aiTechnologiesUsed: "AI technologies used",
    categories: "Categories"
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
  function setTotalDataCount(products) {
    document.querySelector("#count-total").innerText = products.length.toString();
  }
  function addProductsToCategories(categories, products) {
    products.forEach((product) => {
      const productCategories = product["categories"];
      productCategories.forEach((productCategory) => {
        const [mainCategory, subCategory] = productCategory.split("_");
        if (product["technologyReadinessLevel"].substring(0, 3) != "trl") {
          product["technologyReadinessLevel"] = `trl-${product["technologyReadinessLevel"]}`;
        }
        if (typeof product["mediatype"] == "string") {
        } else if (product["mediatype"].length > 1) {
          product["mediatype"] = "mediatype-mixed";
        } else {
          product["mediatype"] = `mediatype-${product["mediatype"]}`;
        }
        if (subCategory != null) {
          categories[mainCategory]["subcategories"][subCategory]["products"].push(product);
        } else {
          categories[mainCategory]["products"].push(product);
        }
      });
    });
  }
  function addProductsToHtmlElement(products, htmlTarget) {
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
        product["technologyReadinessLevel"],
        product["mediatype"]
      );
      productImage.alt = product["name"];
      productImage.src = `img/${product["logo"]}`;
      productName.innerText = product["name"];
      product["aiTechnologiesUsed"].forEach((aiTechnology) => {
        const aiTechnologyDiv = document.createElement("div");
        aiTechnologyDiv.classList.add("ai-technology");
        aiTechnologyDiv.innerText = aiTechnology;
        productClone.querySelector(".product-content").appendChild(aiTechnologyDiv);
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
        showModal(event.currentTarget);
      });
    });
  }
  function addCategoriesAndProductsToPage(categories) {
    for (const [categoryKey] of Object.entries(categories)) {
      let html = `
        <div class="category" id="${categoryKey}">
            <h2 class="category-header">
                ${categories[categoryKey]["description"]} <span class="counter-text"><span class="count-product">0</span> Produkte</span>
            </h2>
            <ul class="product-list" id="list-${categoryKey}"></ul>
        </div>`;
      document.querySelector("#row-products").innerHTML += html;
      addProductsToHtmlElement(
        categories[categoryKey]["products"],
        document.querySelector(`#${categoryKey} ul`)
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
          document.querySelector(`#${subcategoryKey} .product-list`)
        );
      }
      document.querySelector(
        `#${categoryKey} .count-product`
      ).innerText = document.querySelectorAll(`#${categoryKey} .product`).length.toString();
    }
  }
  function setModalFields() {
    const modalGrid = document.querySelector("#modal #modal-grid");
    for (const [key, name] of Object.entries(PRODUCT_KEY_NAMES)) {
      if (key == "logo") {
        continue;
      }
      const keyColumn = document.createElement("div");
      keyColumn.innerText = name;
      modalGrid?.appendChild(keyColumn);
      const nameColumn = document.createElement("div");
      nameColumn.dataset[key] = "";
      modalGrid?.appendChild(nameColumn);
    }
  }
  var dialog = document.querySelector("dialog");
  function showModal(element) {
    if (element == null || !(element instanceof Element)) {
      return;
    }
    const modal = document.querySelector("#modal");
    for (const [key, _] of Object.entries(PRODUCT_KEY_NAMES)) {
      if (key === "logo") {
        continue;
      }
      try {
        modal.querySelector(`[data-${key}]`).innerText = element.getAttribute(`data-${key}`);
      } catch (error) {
        console.error(error);
      }
    }
    modal.querySelector(
      "[data-logo]"
    ).src = `img/${element.getAttribute("data-logo")}`;
    modal.showModal();
  }
  function closeModal(event) {
    if (event.target === dialog) {
      dialog.close();
    }
  }
  dialog.addEventListener("click", closeModal);
  console.clear();
  Promise.all([
    loadJson("data/categories.json"),
    loadJson("data/products.json")
  ]).then((values) => {
    const [categories, products] = values;
    if (categories == null || products == null) {
      return;
    }
    setTotalDataCount(products);
    addProductsToCategories(categories, products);
    addCategoriesAndProductsToPage(categories);
    setModalFields();
    setEqualProductHeight();
  });
})();
