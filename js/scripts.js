$( document ).ready(function() {
    // switches for displaying various information
    var showProductCount = false;
    var showLegend = true;
    var showNavbar = false;
    var showTitle = false;
    // configuration files
    var requestCategories = $.getJSON( "json/categories.json" );
    var requestProducts = $.getJSON( "json/products.json" );
    
    $.when(requestCategories, requestProducts)
    .done(function(dataCategories, dataProducts) {
        // count all products
        $("#count-total").html(dataProducts[0].length);

        // Executed when both requests complete successfully
        // Both results are available here
        
        // create segment for each category in categories.json
        $.each( dataCategories[0], function() {
            currentCategoryShort = this.nameShort;
            currentCategoryLong = this.nameLong;
            currentProductCount = 0;
            
            html = `
            <div class="category-wrapper col-md-6" id="${currentCategoryShort}">
            <div class="category-header">
            ${currentCategoryLong} <span class="counter-text">(<span class="count-product">0</span> Produkte)</item>
            </div>
            <ul class="list-inline" id="list-${currentCategoryShort}">
            </ul>
            `;
            $("#row-products").append(html);
        });
        
        // sort products by manufacturer
        // https://stackoverflow.com/a/14208661
        dataProducts[0].sort(function (a, b) {
            return a.manufacturer.localeCompare( b.manufacturer );
        });
        
        // go through each item in products.json
        $.each( dataProducts[0], function() {
            currentName = this.name;
            currentManufacturer = this.manufacturer;
            currentLogo = this.logo;
            currentLink = this.link;
            currentDescription = this.description;
            currentCategories = this.categories;
            if(this.mediatype.length > 1){
                currentMediatype = "mediatype-mixed";
            } else{
                currentMediatype = "mediatype-" + this.mediatype;
            };
            
            // go through each category of the item and add the product to the correspondig section
            $.each( currentCategories, function(key, currentCategory) {
                // only show manufacturer if it isn't the same as the product name
                if(currentManufacturer != currentName){
                    currentProduct = currentManufacturer + " <b>" + currentName + "</b>";
                } else{
                    currentProduct = "<b>" + currentName + "</b>";
                }

                html = `
                <li class="product-wrapper text-center list-inline-item ${currentMediatype}">
                    <a href="${currentLink}" title="${currentDescription}" target="_blank" class="product-link">
                        <img class="logo" src="img/${currentLogo}">
                        <span class="product-name">${currentProduct}</span>
                    </a>
                </li>
                `;
                
                $("#list-" + currentCategory).append(html);
                
                // increase count of products in current category
                $("#" + currentCategory + " span.count-product").html(parseInt($("#" + currentCategory + " span.count-product").html(), 10)+1);
            });
        });

        // show or hide various information
        if (showProductCount){
            $(".counter-text").show();
        } else{
            $(".counter-text").hide();
        };
        if(showLegend){
            $(".row-legend").show();
        } else{
            $(".row-legend").hide();
        };
        if (showNavbar){
            $("nav").show();
        } else{
            $("nav").hide();
        }
        if (showTitle){
            $("h1").show();
        } else{
            $("h1").hide();
        }
    })
    .fail(function() {
        // Executed if at least one request fails
    })
});