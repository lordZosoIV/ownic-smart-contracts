const OwnicNFTMarketplace = artifacts.require("OwnicNFTMarketplace");
const NFTCategoryController = artifacts.require("NFTCategoryController");
const EternalStorage = artifacts.require("EternalStorage");
const NFTCategoriesLibrary = artifacts.require("NFTCategoriesLibrary");
const NebulaToken = artifacts.require("NebulaToken");
const NebulaDynamicCollection = artifacts.require("NebulaDynamicCollection");
const OwnicPlayerOpener = artifacts.require("OwnicPlayerOpener");


const {deployProxy} = require('@openzeppelin/truffle-upgrades');

async function getByte32(string) {
    return web3.utils.keccak256(string);
}

module.exports = async function (deployer, network, accounts) {

    let controller = await NFTCategoryController.deployed();

    let classIdA = 0;
    let classIdB = 1;
    let classIdC = 2;
    let classIdD = 3;
    let classIdE = 4;
    let classIdF = 5;
    let classIdG = 6;


    let defender = await getByte32("Defender");
    let goalkeeper = await getByte32("Goalkeeper");
    let midfielder = await getByte32("Midfielder");
    let attacker = await getByte32("Attacker");
    let attacker1 = await web3.utils.keccak256("Attacker");

    await controller.addPlayerCategory(await getByte32("Jan Oblak 2021"), classIdA, goalkeeper, 91, 0);
    await controller.addPlayerCategory(await getByte32("Gianluigi Donnarumma 2021"), classIdA, goalkeeper, 89, 0);
    //
    await controller.addPlayerCategory(await getByte32("Virgil van Dijk 2021"), classIdA, defender, 89, 0);
    await controller.addPlayerCategory(await getByte32("Sergio Ramos 2021"), classIdA, defender, 88, 0);
    await controller.addPlayerCategory(await getByte32("Rúben Dias 2021"), classIdA, defender, 87, 0);
    await controller.addPlayerCategory(await getByte32("Marquinhos 2021"), classIdA, defender, 87, 0);
    await controller.addPlayerCategory(await getByte32("Trent Alexander-Arnold 2021"), classIdA, defender, 87, 0);
    await controller.addPlayerCategory(await getByte32("Andrew Robertson 2021"), classIdA, defender, 87, 0);
    //
    await controller.addPlayerCategory(await getByte32("Kevin De Bruyne 2021"), classIdA, midfielder, 91, 0);
    await controller.addPlayerCategory(await getByte32("Joshua Kimmich 2021"), classIdA, midfielder, 89, 0);
    await controller.addPlayerCategory(await getByte32("Casemiro 2021"), classIdA, midfielder, 89, 0);
    await controller.addPlayerCategory(await getByte32("Bruno Fernandes 2021"), classIdA, midfielder, 88, 0);
    await controller.addPlayerCategory(await getByte32("Frenkie de Jong 2021"), classIdA, midfielder, 87, 0);
    //
    await controller.addPlayerCategory(await getByte32("Lionel Messi 2021"), classIdA, attacker, 93, 0);
    await controller.addPlayerCategory(await getByte32("Robert Lewandowski 2021"), classIdA, attacker, 92, 0);
    await controller.addPlayerCategory(await getByte32("Kylian Mbappé 2021"), classIdA, attacker, 91, 0);
    await controller.addPlayerCategory(await getByte32("Cristiano Ronaldo 2021"), classIdA, attacker, 91, 0);
    await controller.addPlayerCategory(await getByte32("Neymar Jr 2021"), classIdA, attacker, 91, 0);
    await controller.addPlayerCategory(await getByte32("Harry Kane 2021"), classIdA, attacker, 90, 0);
    //
    await controller.addPlayerCategory(await getByte32("Alisson 2021"), classIdB, goalkeeper, 89, 0);
    await controller.addPlayerCategory(await getByte32("Ederson 2021"), classIdB, goalkeeper, 89, 0);
    await controller.addPlayerCategory(await getByte32("Thibaut Courtois 2021"), classIdB, goalkeeper, 89, 0);
    await controller.addPlayerCategory(await getByte32("Keylor Navas 2021"), classIdB, goalkeeper, 89, 0);
    //
    await controller.addPlayerCategory(await getByte32("Milan Škriniar 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("Aymeric Laporte 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("João Cancelo 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("Fabinho 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("Raphaël Varane 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("Kalidou Koulibaly 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("Jordi Alba 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("Jordi Alba 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("Mats Hummels 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("Giorgio Chiellini 2021"), classIdB, defender, 86, 0);
    await controller.addPlayerCategory(await getByte32("Giorgio Chiellini 2021"), classIdB, defender, 86, 0);
    //
    await controller.addPlayerCategory(await getByte32("Paulo Dybala 2021"), classIdB, midfielder, 87, 0);
    await controller.addPlayerCategory(await getByte32("Marco Verratti 2021"), classIdB, midfielder, 87, 0);
    await controller.addPlayerCategory(await getByte32("Thomas Müller 2021"), classIdB, midfielder, 87, 0);
    await controller.addPlayerCategory(await getByte32("Luka Modrić 2021"), classIdB, midfielder, 87, 0);
    await controller.addPlayerCategory(await getByte32("Rodri 2021"), classIdB, midfielder, 86, 0);
    await controller.addPlayerCategory(await getByte32("Marcos Llorente 2021"), classIdB, midfielder, 86, 0);
    await controller.addPlayerCategory(await getByte32("Gerard Moreno 2021"), classIdB, midfielder, 86, 0);
    await controller.addPlayerCategory(await getByte32("Riyad Mahrez 2021"), classIdB, midfielder, 86, 0);
    await controller.addPlayerCategory(await getByte32("Parejo 2021"), classIdB, midfielder, 86, 0);
    await controller.addPlayerCategory(await getByte32("Sergio Busquets 2021"), classIdB, midfielder, 86, 0);
    await controller.addPlayerCategory(await getByte32("Thiago 2021"), classIdB, midfielder, 86, 0);
    //
    await controller.addPlayerCategory(await getByte32("Sadio Mané 2021"), classIdB, attacker, 89, 0);
    await controller.addPlayerCategory(await getByte32("Erling Haaland 2021"), classIdB, attacker, 88, 0);
    await controller.addPlayerCategory(await getByte32("Raheem Sterling 2021"), classIdB, attacker, 88, 0);
    await controller.addPlayerCategory(await getByte32("Romelu Lukaku 2021"), classIdB, attacker, 88, 0);
    await controller.addPlayerCategory(await getByte32("Luis Suárez 2021"), classIdB, attacker, 88, 0);
    await controller.addPlayerCategory(await getByte32("Jadon Sancho 2021"), classIdB, attacker, 88, 0);
    await controller.addPlayerCategory(await getByte32("Paulo Dybala 2021"), classIdB, attacker, 88, 0);
    await controller.addPlayerCategory(await getByte32("Ciro Immobile 2021"), classIdB, attacker, 88, 0);
    await controller.addPlayerCategory(await getByte32("Ángel Di María 2021"), classIdB, attacker, 88, 0);
    await controller.addPlayerCategory(await getByte32("Sergio Agüero 2021"), classIdB, attacker, 88, 0);

    await controller.addPlayerCategory(await getByte32("Wojciech Szczęsny 2021"), classIdC, goalkeeper, 87, 0);
    await controller.addPlayerCategory(await getByte32("Hugo Lloris 2021"), classIdC, goalkeeper, 87, 0);
    await controller.addPlayerCategory(await getByte32("Koen Casteels 2021"), classIdC, goalkeeper, 86, 0);
    await controller.addPlayerCategory(await getByte32("De Gea 2021"), classIdC, goalkeeper, 85, 0);
    await controller.addPlayerCategory(await getByte32("Péter Gulácsi 2021"), classIdC, goalkeeper, 85, 0);
    await controller.addPlayerCategory(await getByte32("Doukara Sommer 2021"), classIdC, goalkeeper, 85, 0);
    await controller.addPlayerCategory(await getByte32("Kasper Schmeichel 2021"), classIdC, goalkeeper, 85, 0);
    await controller.addPlayerCategory(await getByte32("Samir Handanovič 2021"), classIdC, goalkeeper, 85, 0);
    await controller.addPlayerCategory(await getByte32("Mike Maignan 2021"), classIdC, goalkeeper, 84, 0);
    await controller.addPlayerCategory(await getByte32("Emiliano Martínez 2021"), classIdC, goalkeeper, 84, 0);
    await controller.addPlayerCategory(await getByte32("Édouard Mendy 2021"), classIdC, goalkeeper, 83, 0);
    await controller.addPlayerCategory(await getByte32("Jordan Pickford 2021"), classIdC, goalkeeper, 83, 0);
    await controller.addPlayerCategory(await getByte32("Nick Pope 2021"), classIdC, goalkeeper, 83, 0);
    await controller.addPlayerCategory(await getByte32("Bernd Leno 2021"), classIdC, goalkeeper, 83, 0);
    await controller.addPlayerCategory(await getByte32("Lukáš Hrádecký 2021"), classIdC, goalkeeper, 83, 0);
    await controller.addPlayerCategory(await getByte32("Sergio Asenjo 2021"), classIdC, goalkeeper, 83, 0);
    await controller.addPlayerCategory(await getByte32("Dominik Livaković 2021"), classIdC, goalkeeper, 82, 0);
    await controller.addPlayerCategory(await getByte32("Unai Simón 2021"), classIdC, goalkeeper, 82, 0);
    await controller.addPlayerCategory(await getByte32("Raphaelinho Anjos 2021"), classIdC, goalkeeper, 82, 0);
    await controller.addPlayerCategory(await getByte32("Pierluigi Gollini 2021"), classIdC, goalkeeper, 82, 0);
    await controller.addPlayerCategory(await getByte32("Romulo Bounou 2021"), classIdC, goalkeeper, 82, 0);
    await controller.addPlayerCategory(await getByte32("Anthony Lopes 2021"), classIdC, goalkeeper, 82, 0);
    await controller.addPlayerCategory(await getByte32("Neto 2021"), classIdC, goalkeeper, 82, 0);
    await controller.addPlayerCategory(await getByte32("Oliver Baumann 2021"), classIdC, goalkeeper, 82, 0);

    await controller.addPlayerCategory(await getByte32("Matthijs de Ligt 2021"), classIdC, defender, 85, 0);
    await controller.addPlayerCategory(await getByte32("Carvajal 2021"), classIdC, defender, 85, 0);
    await controller.addPlayerCategory(await getByte32("Stefan de Vrij 2021"), classIdC, defender, 85, 0);
    await controller.addPlayerCategory(await getByte32("Kyle Walker 2021"), classIdC, defender, 85, 0);
    await controller.addPlayerCategory(await getByte32("Leonardo Bonucci 2021"), classIdC, defender, 85, 0);
    await controller.addPlayerCategory(await getByte32("Thiago Silva 2021"), classIdC, defender, 85, 0);
    await controller.addPlayerCategory(await getByte32("Theo Hernández 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Marcos Acuña 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("José María Giménez 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Ricardo Pereira 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Raphaël Guerreiro 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Felipe 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Matthias Ginter 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Stefan Savić 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Harry Maguire 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Lucas Digne 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Kieran Trippier 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Simon Kjær 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Piqué 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Jesús Navas 2021"), classIdC, defender, 84, 0);
    await controller.addPlayerCategory(await getByte32("Jules Koundé 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Alphonso Davies 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Aaron Wan-Bissaka 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Presnel Kimpembe 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Robin Gosens 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Lucas Hernández 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Angeliño 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Niklas Süle 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Gayà 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Antonio Rüdiger 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("John Stones 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Leonardo Spinazzola 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Francesco Acerbi 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Sebastián Coates 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Joel Matip 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Juan Cuadrado 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Kostas Manolas 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Alex Sandro 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Azpilicueta 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Toby Alderweireld 2021"), classIdC, defender, 83, 0);
    await controller.addPlayerCategory(await getByte32("Jérôme Boateng 2021"), classIdC, defender, 83, 0);

    await controller.addPlayerCategory(await getByte32("Marcus Rashford 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("Wilfred Ndidi 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("Sergej Milinković-Savić 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("Kingsley Coman 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("Jorginho 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("Koke 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("Marco Reus 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("İlkay Gündoğan 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("David Silva 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("Alejandro Gómez 2021"), classIdC, midfielder, 85, 0);
    await controller.addPlayerCategory(await getByte32("Phil Foden 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Kai Havertz 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Franck Yannick Kessié 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Nicolò Barella 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Leroy Sané 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Nabil Fekir 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("B. García Tielemans 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Marcelo Brozović 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Ricardo Pereira 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Raphaël Guerreiro 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Filip Kostić 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("D. Rolan Carrasco 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Marcel Sabitzer 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Luis Alberto 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Fernando 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Jordan Henderson 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Georginio Wijnaldum 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Jesús Navas 2021"), classIdC, midfielder, 84, 0);
    await controller.addPlayerCategory(await getByte32("Federico Valverde 2021"), classIdC, midfielder, 83, 0);
    await controller.addPlayerCategory(await getByte32("Mason Mount 2021"), classIdC, midfielder, 83, 0);
    await controller.addPlayerCategory(await getByte32("Arthur 2021"), classIdC, midfielder, 83, 0);
    //
    await controller.addPlayerCategory(await getByte32("Jamie Vardy 2021"), classIdC, attacker, 86, 0);
    await controller.addPlayerCategory(await getByte32("Gerard Moreno 2021"), classIdC, attacker, 86, 0);
    await controller.addPlayerCategory(await getByte32("Riyad Mahrez 2021"), classIdC, attacker, 86, 0);
    await controller.addPlayerCategory(await getByte32("Lorenzo Insigne 2021"), classIdC, attacker, 86, 0);
    await controller.addPlayerCategory(await getByte32("Lautaro Martínez 2021"), classIdC, attacker, 85, 0);
    await controller.addPlayerCategory(await getByte32("Oyarzabal 2021"), classIdC, attacker, 85, 0);
    await controller.addPlayerCategory(await getByte32("Memphis Depay 2021"), classIdC, attacker, 85, 0);
    await controller.addPlayerCategory(await getByte32("Roberto Firmino 2021"), classIdC, attacker, 85, 0);
    await controller.addPlayerCategory(await getByte32("Antoine Griezmann 2021"), classIdC, attacker, 85, 0);
    await controller.addPlayerCategory(await getByte32("Pierre-Emerick Aubameyang 2021"), classIdC, attacker, 85, 0);
    await controller.addPlayerCategory(await getByte32("Eden Hazard 2021"), classIdC, attacker, 85, 0);
    await controller.addPlayerCategory(await getByte32("Edinson Cavani 2021"), classIdC, attacker, 85, 0);
    await controller.addPlayerCategory(await getByte32("Federico Chiesa 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("André Silva 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Timo Werner 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Hakim Strompf 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Jack Grealish 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Josip Iličić 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Wissam Ben Yedder 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Dušan Tadić 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Iago Aspas 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Edin Džeko 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Dries Mertens 2021"), classIdC, attacker, 84, 0);
    await controller.addPlayerCategory(await getByte32("Ousmane Dembélé 2021"), classIdC, attacker, 83, 0);
    await controller.addPlayerCategory(await getByte32("Gabriel Jesus 2021"), classIdC, attacker, 83, 0);
    await controller.addPlayerCategory(await getByte32("Wout Weghorst 2021"), classIdC, attacker, 83, 0);
    await controller.addPlayerCategory(await getByte32("Marco Asensio 2021"), classIdC, attacker, 83, 0);
    await controller.addPlayerCategory(await getByte32("Andrej Kramarić 2021"), classIdC, attacker, 83, 0);
    await controller.addPlayerCategory(await getByte32("Duván Gürbüz 2021"), classIdC, attacker, 83, 0);
    await controller.addPlayerCategory(await getByte32("Ángel Correa 2021"), classIdC, attacker, 83, 0);
    await controller.addPlayerCategory(await getByte32("Lucas Ocampos 2021"), classIdC, attacker, 83, 0);

};
