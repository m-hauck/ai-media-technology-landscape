declare const JSONEditor: any;

type Product = {
    name: string;
    manufacturer: string;
    productAvailable: string;
    logo: string;
    link: string;
    mediatype: string[];
    description: string;
    technologyReadinessLevel: string[];
    categories: string[];
    paymentModel: string[];
    companyLocation: string;
    funding: string;
    revenuePerYear: string;
    notes: string;
    [key: string]: string | string[];
};

function trimProductWhitespace(product: Product): Product {
    const trimmedProduct = {} as Product;
    for (const [key, value] of Object.entries(product)) {
        if (typeof value === "string") {
            trimmedProduct[key] = value.trim();
        } else {
            trimmedProduct[key] = value;
        }
    }
    return trimmedProduct;
}

function createEditor() {
    return new JSONEditor(document.getElementById("input-editor"), {
        required_by_default: true,
        theme: "spectre",
        schema: {
            type: "object",
            properties: {
                name: {
                    title: "Product name",
                    type: "string",
                    minLength: 1,
                },
                manufacturer: {
                    title: "Manufacturer",
                    type: "string",
                    minLength: 1,
                },
                productAvailable: {
                    title: "Product available?",
                    type: "string",
                    format: "radio",
                    enum: ["true", "false"],
                    options: {
                        enum_titles: ["Yes", "No"],
                    },
                },
                logo: {
                    title: "File name of logo (vector graphics if possible)",
                    type: "string",
                    minLength: 1,
                },
                link: {
                    title: "Link to the product website",
                    type: "string",
                    minLength: 1,
                },
                mediatype: {
                    title: "Product output",
                    type: "array",
                    minItems: 1,
                    uniqueItems: true,
                    items: {
                        type: "string",
                        enum: ["video", "audio", "text", "picture", "other"],
                        options: {
                            enum_titles: [
                                "Video",
                                "Audio",
                                "Text",
                                "Pictures",
                                "Other",
                            ],
                        },
                    },
                },
                description: {
                    title: "Product description (short)",
                    type: "string",
                    minLength: 1,
                },
                technologyReadinessLevel: {
                    title: "Technology-Readiness-Level",
                    type: "string",
                    format: "radio",
                    enum: [
                        "basic-research",
                        "applied-research",
                        "first-applications",
                        "mass-production",
                    ],
                    options: {
                        enum_titles: [
                            "Basic research",
                            "Applied research",
                            "First applications",
                            "Mass production",
                        ],
                    },
                },
                categories: {
                    title: "Classification in value chain",
                    type: "array",
                    minItems: 1,
                    uniqueItems: true,
                    items: {
                        type: "string",
                        enum: [
                            "ProcurementContent",
                            "AcquisitionAdvertisement",
                            "ProductionContent",
                            "AdvertisementPlacement",
                            "Packaging",
                            "TechnicalProduction",
                            "Distribution",
                        ],
                        options: {
                            enum_titles: [
                                "Beschaffung von Informationen und Inhalten",
                                "Akquisition von Werbung",
                                "Produktion und Aggregation von Content",
                                "Plazierung von Werbung",
                                "Packaging der Produkte",
                                "Technische Produktion",
                                "Distribution",
                            ],
                        },
                    },
                },
                paymentModel: {
                    title: "Payment model",
                    type: "array",
                    minItems: 1,
                    uniqueItems: true,
                    items: {
                        type: "string",
                        enum: [
                            "free",
                            "freemium",
                            "paid-once",
                            "paid-periodically",
                            "paid-with-premium-extra",
                            "contact-for-pricing",
                        ],
                        options: {
                            enum_titles: [
                                "Free",
                                "Free with premium extras (Freemium)",
                                "Paid once",
                                "Paid with premium extras",
                                "Paid periodically (subscription)",
                                "Contact for Pricing",
                            ],
                        },
                    },
                },
                companyLocation: {
                    title: "Company headquarters (city or country)",
                    type: "string",
                    required: false,
                },
                funding: {
                    title: "Funding (amount with currency)",
                    type: "string",
                    required: false,
                },
                revenuePerYear: {
                    title: "Revenue per year (with currency)",
                    type: "string",
                    required: false,
                },
                notes: {
                    title: "Notes",
                    type: "string",
                    required: false,
                },
            },
        },
    });
}

export function deleteTableRow(button: HTMLButtonElement) {
    if (button == null || button.parentNode == null) return;
    // Get the row that contains the delete button
    const row = button.parentNode.parentNode;
    if (row == null || row.parentNode == null) return;
    // Remove the row from the table
    row.parentNode.removeChild(row);
}

function addNewProductToTextarea(
    product: Product,
    textarea: HTMLTextAreaElement
) {
    let TEXTAREA_PARSED = JSON.parse(textarea.value) as Product[];
    // Add the new dictionary to the array
    TEXTAREA_PARSED.push(trimProductWhitespace(product));
    // Convert the updated array back to a string format with 4 spaces of indentation
    const TEXTAREA_STRING = JSON.stringify(TEXTAREA_PARSED, null, 4);
    // Set the updated value as the value of the textarea
    textarea.value = TEXTAREA_STRING;
}

function downloadOutputCode() {
    // Get the text from the textarea
    const CODE =
        document.querySelector<HTMLTextAreaElement>("#output-textarea")!.value;

    // Create a new Blob object with the text and set the type to "text/plain"
    const FILE = new Blob([CODE], { type: "text/plain" });

    // Create a new anchor element and set its href attribute to the URL of the Blob
    const ANCHOR = document.createElement("a");
    ANCHOR.href = URL.createObjectURL(FILE);

    // Set the anchor element's download attribute to the desired filename with timestamp
    const TIMESTAMP = new Date()
        .toISOString()
        .replace(/[-T:.Z]/g, "")
        .slice(0, 12);

    // Set the anchor element's download attribute to the desired filename
    ANCHOR.download = `products_${TIMESTAMP.slice(0, 8)}_${TIMESTAMP.slice(
        8
    )}.json`;

    // Click the anchor element to trigger the download
    ANCHOR.click();

    // Cleanup
    URL.revokeObjectURL(ANCHOR.href);
}

// Initialize the editor with a JSON schema
let EDITOR = createEditor();

const SUBMIT_BUTTON = document.querySelector<HTMLButtonElement>("#submit")!;

SUBMIT_BUTTON.addEventListener("click", () => {
    const errors = EDITOR.validate();
    const indicator = document.getElementById("valid_indicator")!;
    // Not valid
    if (errors.length) {
        indicator.style.display = "inherit";
        return;
    }
    // Valid
    indicator.style.display = "none";

    const OUTPUT_TABLE_BODY =
        document.querySelector<HTMLTableElement>("#output-table")!;
    const OUTPUT_TEXTAREA =
        document.querySelector<HTMLTextAreaElement>("#output-textarea")!;

    const NEW_PRODUCT = EDITOR.getValue() as Product;

    addNewProductToTextarea(NEW_PRODUCT, OUTPUT_TEXTAREA);

    const LOGO_STRING =
        NEW_PRODUCT["logo"] == null || NEW_PRODUCT["logo"] == ""
            ? ""
            : `<img src="img/${NEW_PRODUCT["logo"]}">`;

    OUTPUT_TABLE_BODY.innerHTML += `
        <tr>
            <td>${NEW_PRODUCT["name"]}</td>
            <td>${NEW_PRODUCT["manufacturer"]}</td>
            <td>${LOGO_STRING}</td>
            <td><a href="${NEW_PRODUCT["link"]} target="_blank">${NEW_PRODUCT["link"]}</a></td>
            <td>${NEW_PRODUCT["mediatype"]}</td>
            <td>${NEW_PRODUCT["description"]}</td>
            <td>${NEW_PRODUCT["technologyReadinessLevel"]}</td>
            <td>${NEW_PRODUCT["paymentModel"]}</td>
            <td>${NEW_PRODUCT["categories"]}</td>
            <td>${NEW_PRODUCT["paymentModel"]}</td>
            <td>
            <!--<button class="delete">x</button>-->
        </tr>
        `;

    // Get all the delete buttons in the table
    const deleteButtons = document.querySelectorAll<HTMLButtonElement>(
        "table button.delete"
    );

    // Add an event listener to each delete button
    for (const button of deleteButtons) {
        button.addEventListener("click", function () {
            deleteTableRow(this);
        });
    }

    // Clear all input fields
    EDITOR.destroy();
    EDITOR = createEditor();
});

// Download button
const DOWNLOAD_BUTTON =
    document.querySelector<HTMLButtonElement>("#download-button")!;
DOWNLOAD_BUTTON.addEventListener("click", () => {
    downloadOutputCode();
});
