const axios = require('axios');
const fs = require('fs');
const path = require('path');

const webhookUrl = "https://discord.com/api/webhooks/1274810791782125568/PTMN7nuxkBNDkxea9_xpizqs6BjJ4eTwJubm0TgvVJCQozq6QMoFNB1t4lQG667Mjr85"; 
const fortniteApiUrl = "https://fortnite-api.com/v2/cosmetics/br";
const catalogConfigPath = path.join(__dirname, "..", 'Config', 'catalog_config.json');

const seasonLimit = 8; 
const dailyItemsCount = 6;
const featuredItemsCount = 1;

console.log("Welcome to the Jungle Auto Rotate! Made by nade ;)");
console.log(" ");

async function fetchCosmetics() {
    try {
        const response = await axios.get(fortniteApiUrl);
        const cosmetics = response.data.data || [];

        return cosmetics.filter(item => {
            const { chapter, season } = item.introduction || {};
            return chapter === '1' && season && parseInt(season, 10) <= seasonLimit;
        });
    } catch (error) {
        console.error('Error fetching cosmetics:', error.message || error);
        return [];
    }
}

function pickRandomItems(items, count) {    
    const shuffled = items.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function formatItemGrants(item) {
    const { id, backendValue, type } = item;
    let itemType;

    switch (type.value.toLowerCase()) {
        case "outfit":
            itemType = "AthenaCharacter";  
            break;
        case "emote":
            itemType = "AthenaDance";  
            break;
        default:
            itemType = backendValue || `Athena${capitalizeFirstLetter(type.value)}`;
            break;
    }

    return [`${itemType}:${id}`];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getPrice(item) {
    if (item.id === "MusicPack_009_StarPower") {
        return 950; 
    }

    const min = 200;
    const max = 1200;
    const validPrices = Array.from({ length: ((max - min) / 50) + 1 }, (_, i) => min + i * 50).filter(price => price % 100 === 0 || price % 50 === 0);
    return validPrices[Math.floor(Math.random() * validPrices.length)];
}

function updateCatalogConfig(dailyItems, featuredItems) {
    const catalogConfig = { "//": "BR Item Shop Config" };

    dailyItems.forEach((item, index) => {
        catalogConfig[`daily${index + 1}`] = {
            itemGrants: formatItemGrants(item),
            price: getPrice(item)
        };
    });

    featuredItems.forEach((item, index) => {
        catalogConfig[`featured${index + 1}`] = {
            itemGrants: formatItemGrants(item),
            price: getPrice(item)
        };
    });

    fs.writeFileSync(catalogConfigPath, JSON.stringify(catalogConfig, null, 2), 'utf-8');
    console.log("Item Shop updated!");
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
        const itemName = item.id === "MusicPack_009_StarPower" ? "Swing Lynn" : (item.name || "Unknown Item");
        embed.fields.push({
            name: itemName,
            value: `Rarity: ${item.rarity?.displayValue || "Unknown"}\nPrice: ${getPrice(item)} V-Bucks`,
            inline: true
        });
    });

    itemShop.featured.forEach(item => {
        const itemName = item.id === "MusicPack_009_StarPower" ? "Swing Lynn" : (item.name || "Unknown Item");
        embed.fields.push({
            name: itemName,
            value: `Rarity: ${item.rarity?.displayValue || "Unknown"}\nPrice: ${getPrice(item)} V-Bucks`,
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

function shouldIncludeSpecialItem(probability) {
    return Math.random() < probability;
}

async function rotateItemShop() {
    try {
        const cosmetics = await fetchCosmetics();
        if (cosmetics.length === 0) {
            console.error('No cosmetics found!');
            return;
        }

        const dailyItems = pickRandomItems(cosmetics, dailyItemsCount);
        const featuredItems = pickRandomItems(cosmetics, featuredItemsCount);

        if (shouldIncludeSpecialItem(0.2)) { 
            const specialItem = {
                id: "MusicPack_009_StarPower",
                backendValue: "AthenaMusicPack",
                type: { value: "Music" },
                rarity: { displayValue: "Jungle Series" }, 
                name: "Swing Lynn"
            };

            const itemToReplaceIndex = Math.floor(Math.random() * dailyItems.length);
            dailyItems[itemToReplaceIndex] = specialItem;
        }

        updateCatalogConfig(dailyItems, featuredItems);
        await pushToDiscord({ daily: dailyItems, featured: featuredItems });
    } catch (error) {
        console.error('Error in rotateItemShop:', error.message || error);
    }
}

function getMillisecondsUntilNextRotation() {
    const now = new Date();
    const nextRotation = new Date(now);
    nextRotation.setUTCHours(6, 0, 0, 0);

    if (now.getUTCHours() >= 6) {
        nextRotation.setUTCDate(now.getUTCDate() + 1);
    }

    return nextRotation.getTime() - now.getTime();
}

rotateItemShop();

setTimeout(function scheduleNextRotation() {
    rotateItemShop();
    setInterval(rotateItemShop, 24 * 60 * 60 * 1000); 
}, getMillisecondsUntilNextRotation());
