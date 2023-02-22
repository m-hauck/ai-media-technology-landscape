(() => {
  // src/main.ts
  function sortDict(unsortedDict) {
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
      var xhr = new XMLHttpRequest();
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
  function setTotalDataCount(data) {
    document.querySelector("#count-total").innerText = data.length.toString();
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
    const productsTemplate = document.querySelector("#product-template");
    products.forEach((product) => {
      let productClone = productsTemplate.content.cloneNode(
        true
      );
      productClone.querySelector("li").classList.add(
        product["technologyReadinessLevelClass"],
        product["mediaTypeClass"]
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
  function addProductsToPage(categories) {
    console.log(categories);
    for (const [categoryKey, categoryValue] of Object.entries(categories)) {
      let html = `
        <div class="card">
            <div class="category-wrapper" id="${categoryKey}">
                <div class="category-header clearfix">
                    ${categories[categoryKey]["description"]} <span class="counter-text"><span class="count-product">0</span> Produkte</span>
                </div>
                <ul class="list-inline" id="list-${categoryKey}">
                </ul>
            </div>
        </div>`;
      document.querySelector("#row-products").innerHTML += html;
      addProductsToHtmlElement(
        categories[categoryKey]["products"],
        document.querySelector(`#${categoryKey} ul`)
      );
      const subcategories = categories[categoryKey]["subcategories"];
      const subcategoriesSorted = sortDict(subcategories);
      for (const [subcategoryKey, subcategoryValue] of Object.entries(
        subcategoriesSorted
      )) {
        const subcategoryHeader = document.createElement("div");
        subcategoryHeader.classList.add(
          "subcategory-header",
          "card-subtitle",
          "mb-2",
          "text-muted"
        );
        subcategoryHeader.innerText = subcategoryValue["description"];
        subcategoryHeader.id = subcategoryKey;
        document.querySelector(`#${categoryKey}`)?.appendChild(subcategoryHeader);
        const subcategoryProductsList = document.createElement("ul");
        subcategoryProductsList.classList.add("list-inline");
        subcategoryProductsList.id = subcategoryKey;
        document.querySelector(`#${subcategoryKey}`)?.appendChild(subcategoryProductsList);
        addProductsToHtmlElement(
          categories[categoryKey]["subcategories"][subcategoryKey]["products"],
          document.querySelector(`#${subcategoryKey}`)
        );
      }
      document.querySelector(
        `#${categoryKey} .count-product`
      ).innerText = document.querySelectorAll(`#${categoryKey} .product-wrapper`).length.toString();
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
    addProductsToPage(categories);
  });
})();