let service = require("./service");
let config = require("./config.json");
let _ = require("lodash");

let secrets = {
    key: process.env.KEY,
    token: process.env.TOKEN
};

if (!(secrets.key && secrets.token)) {
    console.log("Please pass KEY and TOKEN as environment variables.");
    process.exit(1);
}

service.fetchCards(secrets)
    .then(res => {
        let interestingListIds = _.values(config.lists);
        return res.filter(card => {
            return _.includes(interestingListIds, card.idList);
        });
    })
    .then(cards => {
        console.log(`Found ${cards.length} interesting cards.`);

        let listNamesById = _.invert(config.lists);

        // { listName1: cardCount1, listName2: cardCount2... }
        return cards.reduce((acc, card) => {
            let listName = listNamesById[card.idList];
            if (!acc[listName]) {
                acc[listName] = 0;
            }
            acc[listName]++;
            return acc;
        }, {});
    })
    .then(cardCountByListName => {
        console.log(JSON.stringify(cardCountByListName, null, 2));
    })
    .catch(err => {
        console.error(err);
    });
