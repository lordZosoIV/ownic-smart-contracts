const params = require("./params");
web3 = require('web3')

function getByte32(string) {
    return web3.utils.fromAscii(string);
}

async function setupController(controller) {

    let class_victory_edition_01_name = getByte32("VICTORY_EDITION_01");
    let class_victory_edition_02_name = getByte32("VICTORY_EDITION_02");
    let class_victory_edition_03_name = getByte32("VICTORY_EDITION_03");
    let classTournament_edition_01_name = getByte32("TOURNAMENT_EDITION_01");
    let classTournament_edition_02_name = getByte32("TOURNAMENT_EDITION_02");
    let classSigned_card_edition_01_name = getByte32("SIGNED_CARD_EDITION_01");
    let classSigned_card_edition_02_name = getByte32("SIGNED_CARD_EDITION_02");
    let classOriginal_edition_01_name = getByte32("ORIGINAL_EDITION_01");
    let classOriginal_edition_02_name = getByte32("ORIGINAL_EDITION_02");
    let classOriginal_edition_03_name = getByte32("ORIGINAL_EDITION_03");
    let classOriginal_edition_04_name = getByte32("ORIGINAL_EDITION_04");
    let classOriginal_edition_05_name = getByte32("ORIGINAL_EDITION_05");
    let classOne_of_a_kind_edition_01_name = getByte32("ONE_OF_A_KIND_EDITION_01");
    let classOne_of_a_kind_edition_02_name = getByte32("ONE_OF_A_KIND_EDITION_02");
    let classJubile_edition_01_name = getByte32("JUBILE_EDITION_01");

    // TODO move to params
    let class_victory_edition_01_id = 1;
    let class_victory_edition_02_id = 2;
    let classTournament_edition_01_id = 3;
    let classTournament_edition_02_id = 4;
    let classSigned_card_edition_01_id = 5;
    let classSigned_card_edition_02_id = 6;
    let classOne_of_a_kind_edition_01_id = 7;
    let classOne_of_a_kind_edition_02_id = 8;

    let classJubile_edition_01_id = 9;
    let classOriginal_edition_01_id = 10;
    let classOriginal_edition_02_id = 11;
    let classOriginal_edition_03_id = 12;
    let classOriginal_edition_04_id = 13;
    let classOriginal_edition_05_id = 14;
    let class_victory_edition_03_id = 15;



    // await controller.addPlayerClassType(class_victory_edition_01_name, class_victory_edition_01_id, 300, params.SUBGROUP_SHOP);
    await controller.addPlayerClassType(class_victory_edition_02_name, class_victory_edition_02_id, 300, params.SUBGROUP_PRESALE);
    await controller.addPlayerClassType(class_victory_edition_03_name, class_victory_edition_03_id, 300, params.SUBGROUP_PRESALE);
    //
    // await controller.addPlayerClassType(classTournament_edition_01_name, classTournament_edition_01_id, 200, params.SUBGROUP_SHOP);
    await controller.addPlayerClassType(classTournament_edition_02_name, classTournament_edition_02_id, 200, params.SUBGROUP_PRESALE);
    //
    // await controller.addPlayerClassType(classSigned_card_edition_01_name, classSigned_card_edition_01_id, 100, params.SUBGROUP_SHOP);
    await controller.addPlayerClassType(classSigned_card_edition_02_name, classSigned_card_edition_02_id, 100, params.SUBGROUP_PRESALE);
    //
    // await controller.addPlayerClassType(classOne_of_a_kind_edition_01_name, classOne_of_a_kind_edition_01_id, 1, params.SUBGROUP_SHOP);
    await controller.addPlayerClassType(classOne_of_a_kind_edition_02_name, classOne_of_a_kind_edition_02_id, 1, params.SUBGROUP_PRESALE);
    //
    await controller.addPlayerClassType(classJubile_edition_01_name, classJubile_edition_01_id, 100, params.SUBGROUP_PRESALE);
    //
    await controller.addPlayerClassType(classOriginal_edition_01_name, classOriginal_edition_01_id, 499, params.SUBGROUP_PRESALE);
    await controller.addPlayerClassType(classOriginal_edition_02_name, classOriginal_edition_02_id, 1, params.SUBGROUP_SHOP);
    // await controller.addPlayerClassType(classOriginal_edition_03_name, classOriginal_edition_03_id, 700, params.SUBGROUP_SHOP);
    // await controller.addPlayerClassType(classOriginal_edition_04_name, classOriginal_edition_04_id, 800, params.SUBGROUP_SHOP);
    // await controller.addPlayerClassType(classOriginal_edition_05_name, classOriginal_edition_05_id, 1000, params.SUBGROUP_SHOP);


}

module.exports = setupController;