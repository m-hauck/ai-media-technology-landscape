"use strict";
(() => {
  // src/aimtl-landscape.ts
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
        product["technologyReadinessLevelClass"] = product["technologyReadinessLevel"] == null ? "trl-unknown" : `trl-${product["technologyReadinessLevel"]}`;
        product["mediatypeClass"] = product["mediatype"].length > 1 ? "media-type-mixed" : `mediatype-${product["mediatype"]}`;
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
      productClone.querySelector("li").classList.add(
        product["technologyReadinessLevelClass"],
        product["mediatypeClass"]
      );
      productClone.querySelector("a").href = product["link"];
      productClone.querySelector("img").src = `img/${product["logo"]}`;
      productClone.querySelector("img").title = product["description"];
      productClone.querySelector(
        ".product-name"
      ).innerText = product["name"];
      product["aiTechnologiesUsed"].forEach((aiTechnology) => {
        const aiTechnologyDiv = document.createElement("div");
        aiTechnologyDiv.classList.add("ai-technology");
        aiTechnologyDiv.innerText = aiTechnology;
        productClone.querySelector("a").appendChild(aiTechnologyDiv);
      });
      htmlTarget.append(productClone);
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
    setEqualProductHeight();
  });
})();
