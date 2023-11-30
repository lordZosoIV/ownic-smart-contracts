const OwnicController = artifacts.require("OwnicController.sol");
const utils = require("../script/utils");
const params = require("../script/params");
const NFTPower = artifacts.require("NFTPowerMock.sol");
const OwnicCollectionPowerRewards = artifacts.require("OwnicCollectionPowerRewards.sol");
const OwnicToken = artifacts.require("OwnicToken.sol");
const PlayerCollection = artifacts.require('PlayerCollection.sol');
const EternalStorage = artifacts.require("EternalStorage.sol");
const NFTEditionLibrary = artifacts.require("NFTEditionLibrary.sol");


function _getRandom(timestamp, _seed, sender, order) {
    return web3.utils.toBN(web3.utils.keccak256(
        web3.utils.encodePacked(
            {value: timestamp, type: 'uint256'},
            {value: sender, type: 'address'},
            {value: _seed, type: 'uint256'},
            {value: order, type: 'bytes32'}
        )
    ));
}

contract("OwnicController", accounts => {

    let classA_name = utils.getByte32("classA");
    let classB_name = utils.getByte32("classB");
    let classC_name = utils.getByte32("classC");
    let classD_name = utils.getByte32("classD");
    let classE_name = utils.getByte32("classE");
    let classF_name = utils.getByte32("classF");
    let classG_name = utils.getByte32("classG");


    let classA_Id = 1;
    let classB_Id = 2;
    let classC_Id = 3;
    let classD_Id = 4;
    let classE_Id = 5;
    let classF_Id = 6;
    let classG_Id = 7;

    let classA_rarity = 1;
    let classB_rarity = 2;
    let classC_rarity = 4;
    let classD_rarity = 8;
    let classE_rarity = 16;
    let classF_rarity = 32;
    let classG_rarity = 64;

    let nft;
    let token;
    let powerRewards;
    let controller;
    let nftPower;
    let storage;

    let signer = '0x4dd3a7ca8B345f712EA0Da887e8C1EA652643F45';

    const class_A_players = [
        {
            edition_id: 1,
            player_id: 101
        },
        {
            edition_id: 2,
            player_id: 102
        }];
    const class_B_players = [
        {
            edition_id: 11,
            player_id: 103
        },
        {
            edition_id: 12,
            player_id: 104
        }
    ];
    const class_C_players = [
        {
            edition_id: 21,
            player_id: 105
        },
        {
            edition_id: 22,
            player_id: 102
        },
        {
            edition_id: 23,
            player_id: 106
        },
    ];
    const class_D_players = [
        {
            edition_id: 32,
            player_id: 107
        }
    ];
    const class_E_players = [
        {
            edition_id: 41,
            player_id: 108
        },
        {
            edition_id: 42,
            player_id: 109
        }
    ];
    const class_F_players = [
        {
            edition_id: 51,
            player_id: 110
        }
    ];

    const class_G_players = [
        {
            edition_id: 61,
            player_id: 111
        },
        {
            edition_id: 62,
            player_id: 112
        },
        {
            edition_id: 63,
            player_id: 113
        },
    ];


    before(async () => {
        token = await OwnicToken.new("Ownic Test", "OWN", utils.toWei(1_000_000_000));
        nft = await PlayerCollection.new("Player NFT Collection", "OWNICPLAYER", "http://nebula-nft.test/meta");
        powerRewards = await OwnicCollectionPowerRewards.new(accounts[0], token.address, nft.address);
        nftPower = await NFTPower.new(signer, powerRewards.address);
        storage = await EternalStorage.new(accounts[0], accounts[0]);
        let lib = await NFTEditionLibrary.new();
        await OwnicController.link("NFTEditionLibrary", lib.address);
        controller = await OwnicController.new();
        await controller.initialize(storage.address, nft.address, nftPower.address)
        await storage.setAssociatedContract(controller.address);
        await powerRewards.setOwnicController(controller.address);
        await powerRewards.setPowerReconstructorAddress(nftPower.address);
        await nftPower.setControllerRole(controller.address);
        await nft.setTransferProcessor(powerRewards.address);

        await controller.addPlayerClassType(classA_name, classA_Id, classA_rarity, params.SUBGROUP_PRESALE);
        await controller.addPlayerClassType(classB_name, classB_Id, classB_rarity, params.SUBGROUP_SHOP);
        await controller.addPlayerClassType(classC_name, classC_Id, classC_rarity, params.SUBGROUP_PRESALE);
        await controller.addPlayerClassType(classD_name, classD_Id, classD_rarity, params.SUBGROUP_SHOP);
        await controller.addPlayerClassType(classE_name, classE_Id, classE_rarity, params.SUBGROUP_PRESALE);
        await controller.addPlayerClassType(classF_name, classF_Id, classF_rarity, params.SUBGROUP_GIVEAWAY);
        await controller.addPlayerClassType(classG_name, classG_Id, classG_rarity, params.SUBGROUP_GIVEAWAY);

        await controller.addPlayerEdition(class_A_players[0].edition_id, class_A_players[0].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classA_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);
        await controller.addPlayerEdition(class_A_players[1].edition_id, class_A_players[1].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classA_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);

        await controller.addPlayerEdition(class_B_players[0].edition_id, class_B_players[0].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classB_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);
        await controller.addPlayerEdition(class_B_players[1].edition_id, class_B_players[1].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classB_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);

        await controller.addPlayerEdition(class_C_players[0].edition_id, class_C_players[0].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classC_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);
        await controller.addPlayerEdition(class_C_players[1].edition_id, class_C_players[1].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classC_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);
        await controller.addPlayerEdition(class_C_players[2].edition_id, class_C_players[2].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classC_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);

        await controller.addPlayerEdition(class_D_players[0].edition_id, class_D_players[0].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classD_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);

        await controller.addPlayerEdition(class_E_players[0].edition_id, class_E_players[0].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classE_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);
        await controller.addPlayerEdition(class_E_players[1].edition_id, class_E_players[1].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classE_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);

        await controller.addPlayerEdition(class_F_players[0].edition_id, class_F_players[0].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classF_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);

        await controller.addPlayerEdition(class_G_players[0].edition_id, class_G_players[0].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classG_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);
        await controller.addPlayerEdition(class_G_players[1].edition_id, class_G_players[1].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classG_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);
        await controller.addPlayerEdition(class_G_players[2].edition_id, class_G_players[2].player_id, utils.getByte32("NO_WORRY_ABOUT_NAME"), classG_Id, utils.getByte32("NO_WORRY_ABOUT_POSITION"), 1000, 3, 4, true);

    });

    it("editions initial count by class must be correct", async () => {
        let countEditionsByClassId_A = await controller.getEditionsCountByClassId(classA_Id);
        assert.equal(2, countEditionsByClassId_A.toNumber());

        let countEditionsByClassId_B = await controller.getEditionsCountByClassId(classB_Id);
        assert.equal(2, countEditionsByClassId_B.toNumber());

        let countEditionsByClassId_C = await controller.getEditionsCountByClassId(classC_Id);
        assert.equal(3, countEditionsByClassId_C.toNumber());

        let countEditionsByClassId_D = await controller.getEditionsCountByClassId(classD_Id);
        assert.equal(1, countEditionsByClassId_D.toNumber());

        let countEditionsByClassId_E = await controller.getEditionsCountByClassId(classE_Id);
        assert.equal(2, countEditionsByClassId_E.toNumber());

        let countEditionsByClassId_F = await controller.getEditionsCountByClassId(classF_Id);
        assert.equal(1, countEditionsByClassId_F.toNumber());

    });

    it('cards count by class must be correct ', async () => {
        let countEditionsByClassId_A = await controller.getCardsCountByClass(classA_Id);
        assert.equal(classA_rarity * class_A_players.length, countEditionsByClassId_A.toNumber());

        let countEditionsByClassId_B = await controller.getCardsCountByClass(classB_Id);
        assert.equal(classB_rarity * class_B_players.length, countEditionsByClassId_B.toNumber());

        let countEditionsByClassId_C = await controller.getCardsCountByClass(classC_Id);
        assert.equal(classC_rarity * class_C_players.length, countEditionsByClassId_C.toNumber());

        let countEditionsByClassId_D = await controller.getCardsCountByClass(classD_Id);
        assert.equal(classD_rarity * class_D_players.length, countEditionsByClassId_D.toNumber());

        let countEditionsByClassId_E = await controller.getCardsCountByClass(classE_Id);
        assert.equal(classE_rarity * class_E_players.length, countEditionsByClassId_E.toNumber());

        let countEditionsByClassId_F = await controller.getCardsCountByClass(classF_Id);
        assert.equal(classF_rarity * class_F_players.length, countEditionsByClassId_F.toNumber());

    });

    it('initial index of edition must be correct', async () => {
        let editionId = await controller.getPlayerEditionIdByClassId(classA_Id, 1);
        assert.equal(class_A_players[0].edition_id, editionId.toNumber());

        let editionId2 = await controller.getPlayerEditionIdByClassId(classA_Id, 2);
        assert.equal(class_A_players[1].edition_id, editionId2.toNumber());

        let editionId3 = await controller.getPlayerEditionIdByClassId(classB_Id, 1);
        assert.equal(class_B_players[0].edition_id, editionId3.toNumber());

        let editionId4 = await controller.getPlayerEditionIdByClassId(classB_Id, 2);
        assert.equal(class_B_players[1].edition_id, editionId4.toNumber());

        let editionId5 = await controller.getPlayerEditionIdByClassId(classC_Id, 1);
        assert.equal(class_C_players[0].edition_id, editionId5.toNumber());

        let editionId6 = await controller.getPlayerEditionIdByClassId(classC_Id, 2);
        assert.equal(class_C_players[1].edition_id, editionId6.toNumber());

        let editionId7 = await controller.getPlayerEditionIdByClassId(classC_Id, 3);
        assert.equal(class_C_players[2].edition_id, editionId7.toNumber());

        let editionId8 = await controller.getPlayerEditionIdByClassId(classF_Id, 1);
        assert.equal(class_F_players[0].edition_id, editionId8.toNumber());

    });

    it('reduce all editions from class A', async () => {
        let countBefore = await controller.getEditionsCountByClassId(classA_Id);
        assert.equal(class_A_players.length, countBefore.toNumber());

        await controller.reduceEditionCanMinted(class_A_players[0].edition_id, 1);

        let countAfterReduce = await controller.getEditionsCountByClassId(classA_Id);
        assert.equal(class_A_players.length - 1, countAfterReduce.toNumber());

        let editionId = await controller.getPlayerEditionIdByClassId(classA_Id, 1);
        assert.equal(class_A_players[1].edition_id, editionId.toNumber());

        await controller.reduceEditionCanMinted(class_A_players[1].edition_id, 2);

        let countAfter = await controller.getEditionsCountByClassId(classA_Id);
        assert.equal(0, countAfter.toNumber());

    });


    it('reduce partly editions from class A', async () => {
        let countBefore = await controller.getEditionsCountByClassId(classB_Id);
        countBefore = countBefore.toNumber();
        assert.equal(class_B_players.length, countBefore);

        await controller.reduceEditionCanMinted(class_B_players[0].edition_id, 1);
        let countAfterReduce = await controller.getEditionsCountByClassId(classB_Id);
        assert.equal(class_B_players.length, countAfterReduce.toNumber());

        let editionId = await controller.getPlayerEditionIdByClassId(classB_Id, 1 + 10 % countBefore);
        assert.equal(class_B_players[0].edition_id, editionId.toNumber());

        await controller.reduceEditionCanMinted(class_B_players[1].edition_id, 2);
        let countAfterReduce1 = await controller.getEditionsCountByClassId(classB_Id);
        assert.equal(class_B_players.length, countAfterReduce1.toNumber());

        let editionId1 = await controller.getPlayerEditionIdByClassId(classB_Id, 1 + 11 % countBefore);
        assert.equal(class_B_players[1].edition_id, editionId1.toNumber());

        let countAfter = await controller.getEditionsCountByClassId(classB_Id);
        assert.equal(class_B_players.length, countAfter.toNumber());

    });


    it('reduce single edition all cards from class C', async () => {
        let countBefore = await controller.getEditionsCountByClassId(classC_Id);
        countBefore = countBefore.toNumber();
        assert.equal(class_C_players.length, countBefore);

        for (let i = 0; i < classC_rarity; i++) {
            await controller.reduceEditionCanMinted(class_C_players[1].edition_id, i);
        }
        let countAfterReduce = await controller.getEditionsCountByClassId(classC_Id);
        assert.equal(class_C_players.length - 1, countAfterReduce.toNumber());

    });


    it('check editions after removing single edition cards from class C', async () => {
        let editionId1 = await controller.getPlayerEditionIdByClassId(classC_Id, 1);
        assert.equal(class_C_players[0].edition_id, editionId1.toNumber());

        let editionId2 = await controller.getPlayerEditionIdByClassId(classC_Id, 2);
        assert.equal(class_C_players[2].edition_id, editionId2.toNumber());

        let editionId3 = await controller.getPlayerEditionIdByClassId(classC_Id, 3);
        assert.equal(0, editionId3.toNumber());

        let count = await controller.getEditionsCountByClassId(classC_Id);
        assert.equal(class_C_players.length - 1 , count.toNumber());

    });

    it('should return random edition id', async () => {
        let latestBlockNum = await web3.eth.getBlockNumber();
        let latestBlock = await web3.eth.getBlock(latestBlockNum);
        let timestamp = latestBlock.timestamp;
        let _seed = "95250688022146912429659701458105696330965093922381253647056665233705758414322";

        let classPart = _getRandom(timestamp, _seed, accounts[0], web3.utils.keccak256("ClassPart"));

        let editionId = await controller.getEditionIdFromRandom(_seed, params.SUBGROUP_GIVEAWAY, {from: accounts[0]});

        let editionClass = (await controller.getPlayerEdition(editionId.toNumber()))[1].toNumber();

        let classes = [classF_Id, classG_Id];
        let rarities = [classF_rarity, classG_rarity];

        let totalCards = 0;
        for(let i = 0; i < classes.length; i++){
            totalCards += (await controller.getCardsCountByClass(classes[i])).toNumber()
        }

        let currOffset = 0;
        let classOffset = classPart % totalCards;

        let expectedClass = 0;
         for(let i = 0; i < classes.length; i++){
            let currentClassEditionsCount =  await controller.getEditionsCountByClassId(classes[i]);
            let cards = currentClassEditionsCount.toNumber() * rarities[i];

            if(cards === 0){
                continue;
            }

            currOffset += cards;

            if (classOffset < currOffset) {
                expectedClass = classes[i];
                break;
            }
        }

        assert.equal(expectedClass, editionClass);

    });

    it('removing all cards from class F', async () => {
        let countBefore = await controller.getEditionsCountByClassId(classF_Id);
        assert.equal(class_F_players.length, countBefore.toNumber());

        for (let i = 0; i < classF_rarity; i++) {
            await controller.reduceEditionCanMinted(class_F_players[0].edition_id, i);
        }

        let countAfterReduce = await controller.getEditionsCountByClassId(classF_Id);
        assert.equal(class_F_players.length - 1, countAfterReduce.toNumber());

    });

    it('should return edition only from G class', async () => {
        let latestBlockNum = await web3.eth.getBlockNumber();
        let latestBlock = await web3.eth.getBlock(latestBlockNum);
        let timestamp = latestBlock.timestamp;
        let _seed = "95250688022146912429659701458102381253647056665233705758414322";

        let classPart = _getRandom(timestamp, _seed, accounts[0], web3.utils.keccak256("ClassPart"));

        let editionId = await controller.getEditionIdFromRandom(_seed, params.SUBGROUP_GIVEAWAY, {from: accounts[0]});

        let editionClass = (await controller.getPlayerEdition(editionId.toNumber()))[1].toNumber();

        let classes = [classF_Id, classG_Id];
        let rarities = [classF_rarity, classG_rarity];

        let totalCards = 0;
        for(let i = 0; i < classes.length; i++){
            totalCards += (await controller.getCardsCountByClass(classes[i])).toNumber()
        }

        let currOffset = 0;
        let classOffset = classPart % totalCards;

        let expectedClass = 0;
        for(let i = 0; i < classes.length; i++){
            let currentClassEditionsCount =  await controller.getEditionsCountByClassId(classes[i]);
            let cards = currentClassEditionsCount.toNumber() * rarities[i];

            if(cards === 0){
                continue;
            }

            currOffset += cards;

            if (classOffset < currOffset) {
                expectedClass = classes[i];
                break;
            }
        }

        assert.equal(expectedClass, editionClass);

    });


});