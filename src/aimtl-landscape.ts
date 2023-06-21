import { setEmptyModalFields, showModal } from "./aimtl-modal";

export const PAYMENT_MODEL_TEXT: { [key: string]: string } = {
    "free": "Free",
    "freemium": "Freemium",
    "paid-once": "Paid once",
    "paid-with-premium-extra": "Paid with premium extras",
    "paid-periodically": "Paid periodically",
    "contact-for-pricing": "Contact for Pricing",
};

export interface Category {
    [Key: string]: CategoryAttributes;
}
interface CategoryAttributes {
    description: string;
    products: Product[];
    subcategories: Subcategories;
}
interface Subcategories {
    [key: string]: SubcategoryAttributes;
}
interface SubcategoryAttributes {
    description: string;
    products: Product[];
}
type Product = {
    name: string;
    manufacturer: string;
    productAvailable: string;
    logo: string;
    link: string;
    mediatype: string[];
    mediatypeClass: string;
    description: string;
    technologyReadinessLevel: string[];
    technologyReadinessLevelClass: string;
    categories: string[];
    paymentModel: string[];
    companyLocation: string;
    funding: string;
    revenuePerYear: string;
    notes: string;
};

/**
 * Set equal height for all products so that they have an uniform look
 */
function setEqualProductHeight() {
    const products = document.querySelectorAll<HTMLElement>(".product");

    let maxHeight = 0;
    products.forEach((item) => {
        const itemHeight = item.getBoundingClientRect().height;

        // Compare the height to the current maximum and update if it's larger
        if (itemHeight > maxHeight) {
            maxHeight = itemHeight;
        }
    });

    // Set the maxHeight to all products in .product
    products.forEach((item) => {
        item.style.minHeight = `${maxHeight}px`;
    });
}

/**
 * Sort a dictionary by its keys
 * @param unsortedDict Unsorted dictionairy
 * @returns Sorted dictionary
 */
function sortSubcategories(unsortedDict: Subcategories): Subcategories {
    if (unsortedDict == null) {
        return {} as Subcategories;
    }

    const sortedKeys = Object.keys(unsortedDict).sort((a, b) =>
        a.localeCompare(b)
    );
    const sortedDict = {} as Subcategories;
    sortedKeys.forEach((key) => {
        sortedDict[key as keyof Subcategories] =
            unsortedDict[key as keyof Subcategories];
    });

    return sortedDict;
}

/**
 * Load a JSON file from path
 * @param path Path of the JSON file to load
 * @returns Loaded JSON file
 */
function loadJson(path: string): void | Promise<void | Category | Product[]> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status !== 200) {
                reject();
            }
            resolve(JSON.parse(xhr.responseText) as Category | Product[]);
        };
        xhr.open("GET", path, true);
        xhr.send();
    });
}

function getVisibleProducts(htmlSelector: string): string {
    const visibleProducts = document.querySelectorAll<HTMLDivElement>(
        `${htmlSelector} .product:not([style*='display: none'])`
    );

    const uniqueProducts = new Set();
    visibleProducts.forEach((product) => {
        const productText = product.innerText.trim();
        uniqueProducts.add(productText);
    });

    return uniqueProducts.size.toString();
}

/**
 * Add number of visible products in the categories to the corresponding header
 * @param categories List of categories with products
 */
function setProductCounts(categories: Category) {
    // Category product count
    for (const [categoryKey] of Object.entries(categories)) {
        document.querySelector<HTMLSpanElement>(
            `#${categoryKey} .count-product`
        )!.innerText = getVisibleProducts(`#${categoryKey}`);
    }

    // Total data count
    document.querySelector<HTMLSpanElement>("#count-number")!.innerText =
        getVisibleProducts("#row-products");
}

/**
 * Functions that run after all products are loaded
 */
function afterProductsLoaded() {
    document
        .querySelector<HTMLSpanElement>("#counter-total")
        ?.classList.remove("invisible");
    document
        .querySelector<HTMLSpanElement>("#unavailable-products-switch")
        ?.classList.remove("invisible");
}

/**
 * Add products to categories list so that we can afterwards iterate through the categories and directly create the page with the products
 * @param categories Available categories
 * @param products Available products with their associated category
 */
function addProductsToCategories(
    categories: Category,
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
                    ? "mediatype-mixed"
                    : `mediatype-${product["mediatype"]}`;

            if (subCategory != null) {
                categories[mainCategory]["subcategories"][subCategory][
                    "products"
                ].push(product);
            } else {
                categories[mainCategory]["products"].push(product);
            }

            // Sort content by product names
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

/**
 * Add products as HTML to an HTML element
 * @param products Available products
 * @param htmlTarget HTML Element that should contain the products
 */
function addProductsToHtmlElement(
    products: Product[],
    htmlTarget: HTMLElement | null,
    categories: Category
) {
    if (htmlTarget == null) {
        return;
    }

    const productsTemplate =
        document.querySelector<HTMLTemplateElement>("#product-template");

    products.forEach((product: Product) => {
        let productClone = productsTemplate!.content.cloneNode(
            true
        ) as HTMLLinkElement;

        const productListItem = productClone.querySelector("li")!;
        const productImage = productClone.querySelector("img")!;
        const productManufacturer = productClone.querySelector<HTMLSpanElement>(
            ".product-manufacturer"
        )!;
        const productName =
            productClone.querySelector<HTMLSpanElement>(".product-name")!;

        productListItem.classList.add(
            product["technologyReadinessLevelClass"],
            product["mediatypeClass"]
        );
        productImage.alt = product["name"];
        productImage.src = `img/${product["logo"]}`;
        if (product["name"] != product["manufacturer"]) {
            productManufacturer.innerText = product["manufacturer"];
        }
        productName.innerText = product["name"];

        if (product["productAvailable"] == "false") {
            productListItem.classList.add("product-unavailable");
        }

        product["paymentModel"].forEach((paymentModel) => {
            const paymentModelDiv = document.createElement("div");
            paymentModelDiv.classList.add("payment-model");
            paymentModelDiv.innerText = PAYMENT_MODEL_TEXT[paymentModel];
            productClone
                .querySelector(".product-content")!
                .appendChild(paymentModelDiv);
        });

        // Set data attributes for each product property
        for (const [key, _] of Object.entries(product)) {
            if (!product.hasOwnProperty(key)) {
                continue;
            }
            productListItem.dataset[key] =
                product[key as keyof Product].toString();
        }

        htmlTarget.append(productClone);
    });

    // Add event listener after adding each product
    // It has to be added after the products are in the DOM
    // We cannot add the event listener to the productClones because those are only documentFragments
    let productElements = document.querySelectorAll(".product");
    productElements.forEach((element) => {
        element.addEventListener("click", (event) => {
            showModal(event.currentTarget, categories);
        });
    });
}

/**
 * Add all categories and their products to the page
 * @param categories List of categories with products
 */
function addCategoriesAndProductsToPage(categories: Category): void {
    for (const [categoryKey] of Object.entries(categories)) {
        // Add category
        let html = `
        <div class="category" id="${categoryKey}">
            <h2 class="category-header">
                ${categories[categoryKey]["description"]} <span class="counter-text"><span class="count-product">0</span> products</span>
            </h2>
            <ul class="product-list" id="list-${categoryKey}"></ul>
        </div>`;
        document.querySelector<HTMLDivElement>("#row-products")!.innerHTML +=
            html;

        // Add products to main category (products that don't belong to a subcategory)
        addProductsToHtmlElement(
            categories[categoryKey]["products"],
            document.querySelector(`#${categoryKey} ul`),
            categories
        );

        // Add subcategories with their products
        const subcategories = categories[categoryKey]["subcategories"];

        // Sort subcategories by description
        const subcategoriesSorted: Subcategories =
            sortSubcategories(subcategories);
        for (const [subcategoryKey, subcategoryValue] of Object.entries(
            subcategoriesSorted
        )) {
            // Add the subcategory to page
            const subcategoryElement = document.createElement("div");
            subcategoryElement.classList.add(
                "subcategory",
                "card-subtitle",
                "mb-2",
                "text-muted"
            );
            subcategoryElement.id = subcategoryKey;
            document
                .querySelector(`#${categoryKey}`)
                ?.appendChild(subcategoryElement);
            const subcategoryHeader = document.createElement("h3");
            subcategoryHeader.classList.add("subcategory-header");
            subcategoryHeader.innerText = subcategoryValue["description"];
            subcategoryElement.appendChild(subcategoryHeader);

            // Add products to subcategory
            const subcategoryProductsList = document.createElement("ul");
            subcategoryProductsList.classList.add("product-list");
            subcategoryProductsList.id = subcategoryKey;
            document
                .querySelector(`#${categoryKey} #${subcategoryKey}`)
                ?.appendChild(subcategoryProductsList);

            addProductsToHtmlElement(
                categories[categoryKey]["subcategories"][subcategoryKey][
                    "products"
                ],
                document.querySelector(
                    `#${categoryKey} #${subcategoryKey} .product-list`
                ),
                categories
            );
        }

        afterProductsLoaded();
    }
}

/**
 * Toggle the visibility of unavailable products
 * @param categories List of categories with products
 */
function toggleUnavailableProductsVisibility(categories: Category) {
    const INPUT_SWITCH =
        document.querySelector<HTMLInputElement>(".switch input");
    const UNAVAILABLE_PRODUCTS = document.querySelectorAll<HTMLDivElement>(
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

/** Load products and add with categories to page */
Promise.all([loadJson("data/categories.json"), loadJson("data/products.json")])
    .then((values) => {
        const [categories, products] = values;
        if (categories == null || products == null) {
            return;
        }

        addProductsToCategories(categories as Category, products as Product[]);
        addCategoriesAndProductsToPage(categories as Category);
        setProductCounts(categories as Category);
        setEmptyModalFields();
        setEqualProductHeight();
        toggleUnavailableProductsVisibility(categories as Category);
    })
    .catch((error) => console.error(`Could not load values. ${error.stack}`));
