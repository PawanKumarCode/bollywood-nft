// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.1;

//helps in debugging otherwise there is no provision for using  consol in solidity
import "hardhat/console.sol";

//import openZeppelin contracts.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// We need to import the helper functions from the contract that we copy/pasted.
import {Base64} from "./libraries/Base64.sol";

//inherit the contract imported
contract NFT is ERC721URIStorage {
    // option given by openzeppelin to keep track of token ids
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // This is our SVG code. All we need to change is the word that's displayed. Everything else stays the same.
    // So, we make a baseSvg variable here that all our NFTs can use.
    string svgPartOne =
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='";
    string svgPartTwo =
        "' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    //group of colors for radom background
    string[] colors = ["red", "blue", "black", "yellow", "green"];

    //Random words
    string[] firstWords = [
        "Fantastic",
        "Epic",
        "Wild",
        "Spooky",
        "Beautiful",
        "Awesome"
    ];

    string[] secondWords = [
        "Nargis",
        "Madhubala",
        "Sridevi",
        "Madhuri",
        "Nutan",
        "Meena",
        "Waheeda",
        "Sharmila",
        "Rekha",
        "Priyanka",
        "Deepika",
        "Preity",
        "Parveen",
        "Alia",
        "Katrina"
    ];

    string[] thirdWords = [
        "Cupcake",
        "Pizza",
        "Milkshake",
        "Vanilla",
        "Strawberry",
        "Chocolate",
        "Watermelon",
        "Banana",
        "Apple",
        "Burger"
    ];

    //new event to fire when a NFT is minted
    event NewNFTMinted(address sender, uint256 tokenId);

    //we need to pass the  name of our  NFTs token and its symbol.
    constructor() ERC721("PawanKumarArt", "PKART") {
        console.log("This is my NFT contract. Whoa!");
    }

    //random words picker

    function pickRandomFirstWord(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        //seed the random generator
        uint256 rand = random(
            string(abi.encodePacked("First_Word", Strings.toString(tokenId)))
        );

        //squash the number between 0 and length of array
        rand = rand % firstWords.length;
        return firstWords[rand];
    }

    function pickRandomSecondWord(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        uint256 rand = random(
            string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId)))
        );
        rand = rand % secondWords.length;
        return secondWords[rand];
    }

    function pickRandomThirdWord(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        uint256 rand = random(
            string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId)))
        );
        rand = rand % thirdWords.length;
        return thirdWords[rand];
    }

    // Same old stuff, pick a random color.
    function pickRandomColor(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        uint256 rand = random(
            string(abi.encodePacked("COLOR", Strings.toString(tokenId)))
        );
        rand = rand % colors.length;
        return colors[rand];
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    /*
     * get total number of tokens minted so far
     */
    //Todo: complete this
    function getTotalNftMinted() public view returns (uint128) {
        return uint128(_tokenIds.current());
    }

    //A function out user will use to get their NFT
    function makeNFT() public {
        //Get the currnt tokenId, this starts at 0
        uint256 newItemId = _tokenIds.current();
        //max items can be 50 Id starts with 0
        require(newItemId < 50);

        //pick random word from each of the three arrays
        string memory first = pickRandomFirstWord(newItemId);
        string memory second = pickRandomSecondWord(newItemId);
        string memory third = pickRandomThirdWord(newItemId);
        string memory combinedWord = string(
            abi.encodePacked(first, second, third)
        );
        console.log(first);
        console.log(second);
        console.log(third);

        //join (concatenate ) the three words and close the <text> and <svg> tag
        // Add the random color in.
        string memory randomColor = pickRandomColor(newItemId);
        string memory finalSvg = string(
            abi.encodePacked(
                svgPartOne,
                randomColor,
                svgPartTwo,
                combinedWord,
                "</text></svg>"
            )
        );

        // Get all the JSON metadata in place and base64 encode it.
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        // We set the title of our NFT as the generated word.
                        combinedWord,
                        '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                        // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        // Just like before, we prepend data:application/json;base64, to our data.
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("SVG \n-------------");
        console.log(finalSvg);
        console.log("\n--------------");

        //Actually mint the NFT to the sender using msg.sender
        _safeMint(msg.sender, newItemId);

        //Set the NFTs data
        _setTokenURI(newItemId, finalTokenUri);

        console.log("\n--------------------");
        console.log(
            string(
                abi.encodePacked(
                    "https://nftpreview.0xdev.codes/?code=",
                    finalTokenUri
                )
            )
        );
        console.log("--------------------\n");

        console.log(
            "An NFT  W/ ID %s  has been minted to %s",
            newItemId,
            msg.sender
        );

        //increment the counter for when the next NFT is minted
        _tokenIds.increment();

        //emit the event to let the front end know that a NFT minted
        emit NewNFTMinted(msg.sender, newItemId);
    }
}