HOW TO GENERATE JAVA CONTRACT FILE


1) generate abi using: 

[//]: # ()
      node .\script\generateABIs.js
2) generate java class file from abi:

[//]: # ()
      install web3j cli   --> https://github.com/web3j/web3j-cli

setx JAVA_HOME -m "C:\_jdk12.0"


[//]: # ()
      web3j generate solidity [-hV] [-jt] [-st] -a=<abiFile> [-b=<binFile>] -o=<destinationFileDir> -p=<packageName>
[//]: # ()
      web3j generate solidity -a '/home/johnswon/Desktop/nebula/Contracts/abi/OwnicController.abi' -o '/home/johnswon/Desktop/nebula/marketplace/src/main/java/com/nebuladapps/marketplace/contract' -p com.nebuladapps.marketplace.contract