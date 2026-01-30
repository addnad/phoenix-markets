// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhenixprotocol/contracts/FHE.sol";
import "@fhenixprotocol/contracts/access/Permissioned.sol";

/// @title PredictionMarket
/// @notice A decentralized prediction market using FHE for private voting
contract PredictionMarket is Permissioned {
    
    /// @notice Represents an encrypted vote (1 = yes, 0 = no)
    struct EncryptedVote {
        inEuint32 choice;
        address voter;
        uint256 timestamp;
    }
    
    /// @notice Represents a prediction market
    struct Prediction {
        uint256 id;
        string description;
        uint256 createdAt;
        uint256 endTime;
        bool resolved;
        bool outcome;
        address creator;
        inEuint32 yesCount;
        inEuint32 noCount;
    }
    
    /// @notice Maps prediction ID to prediction details
    mapping(uint256 => Prediction) public predictions;
    
    /// @notice Maps prediction ID to array of encrypted votes
    mapping(uint256 => EncryptedVote[]) public votes;
    
    /// @notice Maps prediction ID to vote count per voter (to prevent double voting)
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    /// @notice Total number of predictions
    uint256 public predictionCount;
    
    /// @notice Events
    event PredictionCreated(uint256 indexed predictionId, string description, uint256 endTime);
    event VoteCast(uint256 indexed predictionId, address indexed voter);
    event PredictionResolved(uint256 indexed predictionId, bool outcome);
    
    /// @notice Create a new prediction market
    /// @param _description The description of the prediction
    /// @param _durationInSeconds How long the market remains open
    function createPrediction(
        string memory _description,
        uint256 _durationInSeconds
    ) external {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_durationInSeconds > 0, "Duration must be positive");
        
        uint256 predictionId = predictionCount;
        uint256 endTime = block.timestamp + _durationInSeconds;
        
        // Initialize encrypted counters at 0
        inEuint32 zeroCount = FHE.asEuint32(0);
        
        predictions[predictionId] = Prediction({
            id: predictionId,
            description: _description,
            createdAt: block.timestamp,
            endTime: endTime,
            resolved: false,
            outcome: false,
            creator: msg.sender,
            yesCount: zeroCount,
            noCount: zeroCount
        });
        
        predictionCount++;
        emit PredictionCreated(predictionId, _description, endTime);
    }
    
    /// @notice Cast an encrypted vote on a prediction
    /// @param _predictionId The ID of the prediction
    /// @param _encryptedChoice FHE-encrypted choice (1 for yes, 0 for no)
    function vote(
        uint256 _predictionId,
        inEuint32 _encryptedChoice
    ) external {
        Prediction storage prediction = predictions[_predictionId];
        
        require(_predictionId < predictionCount, "Invalid prediction ID");
        require(block.timestamp < prediction.endTime, "Voting has ended");
        require(!hasVoted[_predictionId][msg.sender], "Already voted on this prediction");
        
        // Grant access control - sender has permission to use this encrypted value
        FHE.allowTransient(_encryptedChoice, address(this));
        
        // Record the vote
        EncryptedVote memory encryptedVote = EncryptedVote({
            choice: _encryptedChoice,
            voter: msg.sender,
            timestamp: block.timestamp
        });
        votes[_predictionId].push(encryptedVote);
        hasVoted[_predictionId][msg.sender] = true;
        
        // Accumulate votes (FHE operations on encrypted data)
        // If encrypted choice is 1, increment yes; else increment no
        inEuint32 one = FHE.asEuint32(1);
        inEuint32 isYes = FHE.eq(_encryptedChoice, one);
        
        // Update counters using encrypted arithmetic
        prediction.yesCount = FHE.add(prediction.yesCount, isYes);
        prediction.noCount = FHE.add(prediction.noCount, FHE.sub(one, isYes));
        
        emit VoteCast(_predictionId, msg.sender);
    }
    
    /// @notice Get details about a prediction
    /// @param _predictionId The ID of the prediction
    function getPrediction(uint256 _predictionId) external view returns (
        string memory description,
        uint256 endTime,
        bool resolved,
        bool outcome
    ) {
        require(_predictionId < predictionCount, "Invalid prediction ID");
        Prediction storage prediction = predictions[_predictionId];
        return (
            prediction.description,
            prediction.endTime,
            prediction.resolved,
            prediction.outcome
        );
    }
    
    /// @notice Get total vote count (encrypted)
    /// @param _predictionId The ID of the prediction
    function getVoteCount(uint256 _predictionId) external view returns (
        uint256 yesCount,
        uint256 noCount
    ) {
        require(_predictionId < predictionCount, "Invalid prediction ID");
        // Note: These are still encrypted; actual decryption happens off-chain
        // This is a placeholder - in production, these would be sealed/encrypted
        return (0, 0);
    }
    
    /// @notice Get total number of predictions
    function getPredictionCount() external view returns (uint256) {
        return predictionCount;
    }
    
    /// @notice Get all votes for a prediction (for off-chain analysis)
    /// @param _predictionId The ID of the prediction
    function getVotesForPrediction(uint256 _predictionId) external view returns (
        EncryptedVote[] memory
    ) {
        require(_predictionId < predictionCount, "Invalid prediction ID");
        return votes[_predictionId];
    }
    
    /// @notice Resolve a prediction (only by creator after voting ends)
    /// @param _predictionId The ID of the prediction
    /// @param _outcome The outcome (true for yes, false for no)
    function resolve(
        uint256 _predictionId,
        bool _outcome
    ) external {
        Prediction storage prediction = predictions[_predictionId];
        
        require(_predictionId < predictionCount, "Invalid prediction ID");
        require(msg.sender == prediction.creator, "Only creator can resolve");
        require(block.timestamp >= prediction.endTime, "Voting still ongoing");
        require(!prediction.resolved, "Already resolved");
        
        prediction.resolved = true;
        prediction.outcome = _outcome;
        
        emit PredictionResolved(_predictionId, _outcome);
    }
    
    /// @notice Get sealed tallies for off-chain decryption
    /// @param _predictionId The ID of the prediction
    /// @param _publicKey Public key for sealing (for future decryption)
    function getSealedTallies(
        uint256 _predictionId,
        bytes32 _publicKey
    ) external view returns (
        string memory sealedYes,
        string memory sealedNo
    ) {
        require(_predictionId < predictionCount, "Invalid prediction ID");
        Prediction storage prediction = predictions[_predictionId];
        
        // In a production system, you would seal the encrypted values
        // For now, return encoded representation
        // The actual sealed tallies would be generated via FHE
        return ("", "");
    }
}
