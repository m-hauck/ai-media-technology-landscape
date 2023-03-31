const modal = document.querySelector("dialog")!;
const modalCloseButton = document.querySelector("dialog #modal-close-button")!;

const PRODUCT_KEY_NAMES = {
    name: "Name",
    manufacturer: "Company",
    logo: "Logo",
    link: "Link",
    mediatype: "Media type",
    description: "Description",
    technologyReadinessLevel: "Technology Readiness Level",
    aiTechnologiesUsed: "AI technologies used",
    categories: "Categories",
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

export function showModal(product: EventTarget | null): void {
    if (product == null || !(product instanceof HTMLElement)) {
        return;
    }
    const modal = document.querySelector<HTMLDialogElement>("#modal")!;

    for (const [key, _] of Object.entries(PRODUCT_KEY_NAMES)) {
        if (key === "logo") {
            modal.querySelector<HTMLImageElement>(
                "[data-logo]"
            )!.src = `img/${product.getAttribute("data-logo")!}`;
            continue;
        }
        if (key === "link") {
            modal.querySelector<HTMLImageElement>(
                "[data-link-content]"
            )!.innerHTML = `<a href="${product.getAttribute(
                "data-link"
            )!}" target="_blank" title="Open external link to '${product.getAttribute(
                "data-name"
            )!}'">${product.getAttribute("data-link")!}</a>`;
            continue;
        }
        if (key === "mediatype") {
            product.dataset.mediatype = textListToTitleCase(
                product.getAttribute("data-mediatype")!
            );
        }
        if (key === "technologyReadinessLevel") {
            console.log(
                textToTitleCase(
                    product.getAttribute("data-technology-readiness-level")!
                )
            );
            product.dataset.technologyReadinessLevel = textToTitleCase(
                product.getAttribute("data-technology-readiness-level")!
            );
        }

        // Converts a camelCase key to kebab-case by using regular expressions and the toLowerCase method.
        // We need kebab-case for the data attribute selector
        const kebabKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
        modal.querySelector<HTMLElement>(
            `[data-${kebabKey}-content]`
        )!.innerText = product.getAttribute(`data-${kebabKey}`)!;

        // Hide row if no data content available
        let display_style = "initial";
        if (product.getAttribute(`data-${kebabKey}`)! == "") {
            display_style = "none";
        }
        modal.querySelector<HTMLElement>(
            `[data-${kebabKey}-name]`
        )!.style.display = display_style;
        modal.querySelector<HTMLElement>(
            `[data-${kebabKey}-content]`
        )!.style.display = display_style;
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
