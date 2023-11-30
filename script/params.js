const {getByte32} = require("./utils");

const SUBGROUP_SHOP = getByte32('SHOP');
const SUBGROUP_PRESALE = getByte32('PRESALE');
const SUBGROUP_GIVEAWAY = getByte32('GIVEAWAY');
const SUBGROUP_PACK = getByte32('PACK');
const POSITION_DEFENDER = getByte32("Defender");
const POSITION_GOALKEEPER = getByte32("Goalkeeper");
const POSITION_MIDFIELDER = getByte32("Midfielder");
const POSITION_ATTACKER = getByte32("Attacker");

module.exports = {
    SUBGROUP_SHOP,
    SUBGROUP_PRESALE,
    SUBGROUP_GIVEAWAY,
    SUBGROUP_PACK,
    POSITION_DEFENDER,
    POSITION_GOALKEEPER,
    POSITION_MIDFIELDER,
    POSITION_ATTACKER
};