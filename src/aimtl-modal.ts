import { Category, PAYMENT_MODEL_TEXT } from "./aimtl-landscape";

const modal = document.querySelector("dialog")!;
const modalCloseButton = document.querySelector("dialog #modal-close-button")!;

const PRODUCT_KEY_NAMES = {
    name: "Name",
    manufacturer: "Company",
    highlightProduct: "Highlight product",
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
    notes: "Notes",
};

/**
 * Transform a string to title case
 * @param text String that should be converted to title case
 * @returns Converted string, e.g., "video,other" --> "Video, Other"
 */
function textListToTitleCase(text: string) {
    return text
        .split(",")
        .map(
            (word) => word.trim().charAt(0).toUpperCase() + word.trim().slice(1)
        )
        .join(", ");
}

/**
 * Function to transform the kebab-case string to a case with starting upper case and spaces
 * @param text String that should be converted
 * @returns Converted string, e.g., "basic-research" --> "Basic Research"
 */
function textToTitleCase(text: string) {
    return text
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Create divs for all available fields in the modal
 */
export function setEmptyModalFields(): void {
    const modalGrid =
        document.querySelector<HTMLDivElement>("#modal #modal-grid");

    for (const [key, name] of Object.entries(PRODUCT_KEY_NAMES)) {
        if (key == "logo") {
            // Logo should be an image and not a div
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

/**
 * Converts a camelCase key to kebab-case by using regular expressions and the toLowerCase method.
 * We need kebab-case for the data attribute selector.
 * @param product HTML product element
 * @param key Key that should be converted
 */
function convertCases(product: HTMLElement, key: string): void {
    const kebabKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    modal.querySelector<HTMLElement>(`[data-${kebabKey}-content]`)!.innerText =
        product.getAttribute(`data-${kebabKey}`) || "";

    // Hide row if no data content available
    let display_style = "initial";
    if (
        product.getAttribute(`data-${kebabKey}`) == null ||
        product.getAttribute(`data-${kebabKey}`) == ""
    ) {
        display_style = "none";
    }
    modal.querySelector<HTMLElement>(`[data-${kebabKey}-name]`)!.style.display =
        display_style;
    modal.querySelector<HTMLElement>(
        `[data-${kebabKey}-content]`
    )!.style.display = display_style;
}

export function showModal(
    product: EventTarget | null,
    categories: Category
): void {
    if (product == null || !(product instanceof HTMLElement)) {
        return;
    }
    const modal = document.querySelector<HTMLDialogElement>("#modal")!;

    for (const [key, _] of Object.entries(PRODUCT_KEY_NAMES)) {
        switch (key) {
            case "logo":
                modal.querySelector<HTMLImageElement>(
                    "[data-logo]"
                )!.src = `img/${product.getAttribute("data-logo")!}`;
                break;

            case "link":
                modal.querySelector<HTMLImageElement>(
                    "[data-link-content]"
                )!.innerHTML = `<a href="${product.getAttribute(
                    "data-link"
                )!}" target="_blank" title="Open external link to '${product.getAttribute(
                    "data-name"
                )!}'">${product.getAttribute("data-link")!}</a>`;
                break;

            case "mediatype":
                product.dataset.mediatype = textListToTitleCase(
                    product.getAttribute("data-mediatype")!
                );
                convertCases(product, key);
                break;

            case "technologyReadinessLevel":
                product.dataset.technologyReadinessLevel = textToTitleCase(
                    product.getAttribute("data-technology-readiness-level")!
                );
                convertCases(product, key);
                break;

            case "categories":
                if (product.dataset.categoriesUpdated != null) {
                    convertCases(product, key);
                    break;
                }
                const productCategories = product
                    .getAttribute("data-categories")!
                    .split(",");

                let productList: string[] = [];
                productCategories.forEach((productCategoryWithSubcategory) => {
                    const [productCategory, productSubcategoryId] =
                        productCategoryWithSubcategory.split("_");
                    productList.push(
                        categories[productCategory]["description"]
                    );
                    if (productSubcategoryId) {
                        productList.push(
                            categories[productCategory]["subcategories"][
                                productSubcategoryId
                            ]["description"]
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

                const paymentModels = product
                    .getAttribute("data-payment-model")!
                    .split(",");

                product.dataset.paymentModel =
                    PAYMENT_MODEL_TEXT[
                        product.getAttribute("data-payment-model")!
                    ];
                let paymentModelList: string[] = [];
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

    modal.showModal();
}

function closeModal(event: Event): void {
    if (
        event.target === modal ||
        (event.target instanceof HTMLElement &&
            event.target.id === "modal-close-button")
    ) {
        modal.close();
    }
}

function setModalEventListeners() {
    modal.addEventListener("click", closeModal);
    modalCloseButton.addEventListener("click", closeModal);
}

setModalEventListeners();
