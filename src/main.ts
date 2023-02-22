interface CategoryAttributes {
    description: string;
    products: string[];
    subcategories: Subcategories;
}

interface Subcategories {
    [key: string]: SubcategoryAttributes;
}

interface SubcategoryAttributes {
    description: string;
    products: string[];
}

interface Category {
    [Key: string]: CategoryAttributes;
}

interface Product {
    name: string;
    manufacturer: string;
    logo: string;
    link: string;
    mediatype: string[];
    description: string;
    technologyReadinessLevel: string;
    aiTechnologiesUsed: string[];
    categories: string[];
}

function sortDict<T extends Record<string, unknown>>(unsortedDict: T): T {
    if (unsortedDict == null) return {} as T;

    const sortedKeys = Object.keys(unsortedDict).sort();
    const sortedDict: T = {} as T;
    sortedKeys.forEach((key) => {
        sortedDict[key as keyof T] = unsortedDict[key as keyof T];
    });

    return sortedDict;
}

function loadJson(path: string): void | Promise<void | Category[] | Product[]> {
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

function setTotalDataCount(data: Product[]): void {
    document.querySelector<HTMLSpanElement>("#count-total")!.innerText =
        data.length.toString();
}

function addProductsToCategories(
    categories: Category[],
    products: Product[]
): void {
    products.forEach((product: Product) => {
        const productCategories = product["categories"];
        productCategories.forEach((productCategory: string) => {
            const [mainCategory, subCategory] = productCategory.split("_");

            product["technologyReadinessLevelClass"] =
                product["technologyReadinessLevel"] == null
                    ? "trl-unknown"
                    : `trl-${product["technologyReadinessLevel"]}`;
            product["mediatypeClass"] =
                product["mediatype"].length > 1
                    ? "media-type-mixed"
                    : `mediatype-${product["mediatype"]}`;

            if (subCategory != null) {
                categories[mainCategory]["subcategories"][subCategory][
                    "products"
                ].push(product);
            } else {
                categories[mainCategory]["products"].push(product);
            }
        });
    });
}

function addProductsToHtmlElement(products: Product[], htmlTarget) {
    const productsTemplate =
        document.querySelector<HTMLTemplateElement>("#product-template");

    products.forEach((product: Product) => {
        let productClone = productsTemplate!.content.cloneNode(
            true
        ) as HTMLLinkElement;
        productClone
            .querySelector("li")!
            .classList.add(
                product["technologyReadinessLevelClass"],
                product["mediaTypeClass"]
            );
        productClone.querySelector("a")!.href = product["link"];
        productClone.querySelector("img")!.src = `img/${product["logo"]}`;
        productClone.querySelector("img")!.title = product["description"];
        productClone.querySelector<HTMLSpanElement>(
            ".product-name"
        )!.innerText = product["name"];

        product["aiTechnologiesUsed"].forEach((aiTechnology) => {
            const aiTechnologyDiv = document.createElement("div");
            aiTechnologyDiv.classList.add("ai-technology");
            aiTechnologyDiv.innerText = aiTechnology;
            productClone.querySelector("a")!.appendChild(aiTechnologyDiv);
        });

        htmlTarget.append(productClone);
    });
}

function addProductsToPage(categories: Category[]): void {
    console.log(categories);
    for (const [categoryKey, categoryValue] of Object.entries(categories)) {
        // Add category
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
        document.querySelector<HTMLDivElement>("#row-products")!.innerHTML +=
            html;

        // Add products to main category (products that don't belong to a subcategory)
        addProductsToHtmlElement(
            categories[categoryKey]["products"],
            document.querySelector(`#${categoryKey} ul`)
        );

        // Add subcategories with their products
        const subcategories = categories[categoryKey]["subcategories"];

        // Sort subcategories by description
        const subcategoriesSorted: Subcategories = sortDict(subcategories);
        for (const [subcategoryKey, subcategoryValue] of Object.entries(
            subcategoriesSorted
        )) {
            // Add the subcategory to page
            const subcategoryHeader = document.createElement("div");
            subcategoryHeader.classList.add(
                "subcategory-header",
                "card-subtitle",
                "mb-2",
                "text-muted"
            );
            subcategoryHeader.innerText = subcategoryValue["description"];
            subcategoryHeader.id = subcategoryKey;
            document
                .querySelector(`#${categoryKey}`)
                ?.appendChild(subcategoryHeader);

            // Add products to subcategory
            const subcategoryProductsList = document.createElement("ul");
            subcategoryProductsList.classList.add("list-inline");
            subcategoryProductsList.id = subcategoryKey;
            document
                .querySelector(`#${subcategoryKey}`)
                ?.appendChild(subcategoryProductsList);

            addProductsToHtmlElement(
                categories[categoryKey]["subcategories"][subcategoryKey][
                    "products"
                ],
                document.querySelector(`#${subcategoryKey}`)
            );
        }

        // Add product count
        document.querySelector<HTMLSpanElement>(
            `#${categoryKey} .count-product`
        )!.innerText = document
            .querySelectorAll(`#${categoryKey} .product-wrapper`)
            .length.toString();
    }
}

console.clear();

Promise.all([
    loadJson("data/categories.json"),
    loadJson("data/products.json"),
]).then((values) => {
    const [categories, products] = values;
    if (categories == null || products == null) {
        return;
    }

    setTotalDataCount(products as Product[]);
    addProductsToCategories(categories as Category[], products as Product[]);

    addProductsToPage(categories as Category[]);

    // TODO: Loading spinner
    // TODO: Replace bootstrap
});
