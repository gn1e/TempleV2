const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const webhookUrl = "https://discord.com/api/webhooks/1274810791782125568/PTMN7nuxkBNDkxea9_xpizqs6BjJ4eTwJubm0TgvVJCQozq6QMoFNB1t4lQG667Mjr85"; 

const fortniteApiBaseUrl = "https://fortnite-api.com/v2/cosmetics/br";

async function getItemDetails(itemId) {
    try {
        const response = await axios.get(`${fortniteApiBaseUrl}/${itemId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching details for item ID ${itemId}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

featuredItems.forEach((item, index) => {
    catalogConfig[`featured${index + 1}`] = {
        itemGrants: formatItemGrants(item),
        price: getPrice()
    };
});

async function getItemShop() {
    const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "responses", "catalog.json")).toString());
    const CatalogConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "Config", "catalog_config.json")).toString());

    try {
        for (let storefront of catalog.storefronts) {
            storefront.catalogEntries = []; 
        }

        for (let value in CatalogConfig) {
            if (!Array.isArray(CatalogConfig[value].itemGrants)) continue;
            if (CatalogConfig[value].itemGrants.length === 0) continue;

            const CatalogEntry = {
                "devName": "",  
                "offerId": "",
                "fulfillmentIds": [],
                "dailyLimit": -1,
                "weeklyLimit": -1,
                "monthlyLimit": -1,
                "categories": [],
                "prices": [{
                    "currencyType": "MtxCurrency",
                    "currencySubType": "",
                    "regularPrice": CatalogConfig[value].price,
                    "finalPrice": CatalogConfig[value].price,
                    "saleExpiration": "9999-12-02T01:12:00Z",
                    "basePrice": CatalogConfig[value].price
                }],
                "meta": { "SectionId": "Featured", "TileSize": "Small" },
                "matchFilter": "",
                "filterWeight": 0,
                "appStoreId": [],
                "requirements": [],
                "offerType": "StaticPrice",
                "giftInfo": { "bIsEnabled": true, "forcedGiftBoxTemplateId": "", "purchaseRequirements": [], "giftRecordIds": [] },
                "refundable": false,
                "metaInfo": [{ "key": "SectionId", "value": "Featured" }, { "key": "TileSize", "value": "Small" }],
                "displayAssetPath": "",
                "itemGrants": [],
                "sortPriority": 0,
                "catalogGroupPriority": 0
            };

            let i = catalog.storefronts.findIndex(p => p.name === (value.toLowerCase().startsWith("daily") ? "BRDailyStorefront" : "BRWeeklyStorefront"));
            if (i === -1) continue;

            if (value.toLowerCase().startsWith("daily")) {
                CatalogEntry.sortPriority = -1;
            } else {
                CatalogEntry.meta.TileSize = "Normal";
                CatalogEntry.metaInfo[1].value = "Normal";
            }

            for (let itemGrant of CatalogConfig[value].itemGrants) {
                if (typeof itemGrant !== "string" || itemGrant.length === 0) continue;

                const itemDetails = await getItemDetails(itemGrant.split(":")[1]);
                if (itemDetails) {
                    CatalogEntry.devName = itemDetails.name || "Unknown Item";
                    CatalogEntry.displayAssetPath = itemDetails.images.icon;
                } else {
                    CatalogEntry.devName = "Unknown Item";
                }

                CatalogEntry.requirements.push({ "requirementType": "DenyOnItemOwnership", "requiredId": itemGrant, "minQuantity": 1 });
                CatalogEntry.itemGrants.push({ "templateId": itemGrant, "quantity": 1 });
            }

            if (CatalogEntry.itemGrants.length > 0) {
                let uniqueIdentifier = crypto.createHash("sha1").update(`${JSON.stringify(CatalogConfig[value].itemGrants)}_${CatalogConfig[value].price}`).digest("hex");

                CatalogEntry.offerId = uniqueIdentifier;

                catalog.storefronts[i].catalogEntries.push(CatalogEntry);
            }
        }
    } catch (err) {
        console.error(err);
    }

    return catalog;
}

async function pushToDiscord(itemShop) {
    const now = new Date();
    const nextRotation = new Date(now);
    nextRotation.setUTCHours(6, 0, 0, 0); 

    if (now.getUTCHours() >= 6) {
        nextRotation.setUTCDate(now.getUTCDate() + 1);
    }
    const timestamp = Math.floor(nextRotation.getTime() / 1000);

    const embed = {
        title: "Jungle Item Shop",
        description: `Item shop rotates every day at <t:${timestamp}:t>!`,
        fields: [],
    };

    itemShop.daily.forEach(item => {
        embed.fields.push({
            name: item.name,
            value: `Rarity: ${item.rarity.displayValue}\nPrice: ${getPrice()} V-Bucks`,
            inline: true
        });
    });

    itemShop.featured.forEach(item => {
        embed.fields.push({
            name: item.name,
            value: `Rarity: ${item.rarity.displayValue}\nPrice: ${getPrice()} V-Bucks`,
            inline: true
        });
    });

    try {
        await axios.post(webhookUrl, { embeds: [embed] });
        console.log("Item shop sent to Discord!");
    } catch (error) {
        console.error("Error sending item shop to Discord:", error.message || error);
    }
}

async function main() {
    const catalog = await getItemShop();
    await pushToDiscord(catalog);
}

main();