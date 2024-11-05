(function(StringLib) {
  'use strict';

  /**
   * Constructor function for Glossary object
   */
  function Glossary(words) {
    this._words = words;
    this._length = this._words.length;
  }

  // Reference to the Glossary prototype
  var glossaryProto = Glossary.prototype;

  /**
   * Returns a random word from the current glossary
   */
  glossaryProto.randWord = function() {
    return this._words[Math.floor(Math.random() * this._length)];
  };

  /**
   * Removes a word from the current glossary
   */
  glossaryProto.removeWord = function(word) {
    var index = this._words.indexOf(word);
    this._words.splice(index, 1);
    this.updateWordCount();
  };

  /**
   * Updates _length of the current glossary
   */
  glossaryProto.updateWordCount = function() {
    this._length = this._words.length;
  };

  // Game object used to to manipulate the timer, score, button choices, current word, and current level
  var game = {};

  // The current word being displayed
  game.currentWord = document.getElementById('current_word');

  // The timer being displayed
  game.timer = document.getElementById('timer');

  // The player's current score
  game.score = document.getElementById('score');

  // The buttons for the answer choices
  game.buttons = document.getElementsByClassName('anagram_button');

  // Hidden loss screen
  game.lossScreen = document.getElementById('loss_screen');

  // Final score displayed on the loss screen
  game.finalScore = document.getElementById('final_score');

  // Reset button displayed on the loss screen
  game.resetButton = document.getElementById('reset');

  // Reference to the current button with the correct answer
  game.correctButton = null;

  // Current difficulty of the game
  game.currentGlossary = null;

  // Level number used to choose the appropriate glossary
  game.level = 0;

  // Score number used to keep track of the player's current score
  game.scoreNum = 0;

  // The remaining time left for the countdown timer
  game.millsecondsLeft = 500;

  // The Glossaries for each of the difficulty levels
  game.glossaries = {
    veryEasy: new Glossary([
		'PIP','HMO','PPO','POS','CAP','SOP','EOB',
		'BOP','AGT','POL','BEN','COP','DIC','HSA',
		'RIP','ELP','FSA','SAV','DED','CLM','INC',
		'TAP','LTD','STD','TPL','MDT','MAX','RPA',
		'LAP','PAK'
    ]),
    easy: new Glossary([
      'CLMS','PREM','RISK','PLAN','COVR','CAPS','DEDU','AGNT','TERM',
	  'RATE','LOSS','LIAB','ASST','FUND','NETT','COBR','HEAL','LIFE',
	  'AUTO','PROP','REIN','POOL','BENE','ADDL','VOID','SAFE','FIRE',
	  'HOPE','PAID','LOSS','RPAI','WAIT','ELIG','TERM','WELL','CARE',
	  'BOND','HOSP','INFO','GOLD' 
    ]),
    medium:  new Glossary([
      'Agent','Claim','Asset','Audit','Bonds','Capex','Cover',
	  'Deduct','Fraud','Gross','Grant','Hazrd','Insur','Lapse',
	  'Legal','Limit','Liabs','Loanr','Medex','Modal','Moral',
	  'Netex','Peril','Payer','Quote','Reins','Repay','Renew',
	  'Rider','Scope','State','Storm','Terms','Trust','Value',
	  'Write','Yield','Coins','Share','Audit'
    ]),
    hard: new Glossary([
      'Policy','Broker','Claims','Adjust','Insure','Assets',
	  'Health','Liable','Damage','Hazard','Bundle','Rebate',
	  'Payout','Rating','Cancel','Holder','Riders','Safety',
	  'Notary','Factor','Waiver','Rescue','Savings','Losses',
	  'Vacant','Income','Repair','Adjust','Assets','Driver',
	  'Notice','Office','Rescue','Cancel','Return','Insure',
	  'Extent','Holder','Client','Signed'
    ]),
    insane: new Glossary([
      'Insurer', 'Liability', 'Premium', 'Policy', 'Broker', 'Adjuster', 'Coverage', 
	  'Renewal', 'Endorse', 'Claims', 'Holders', 'Deducts', 'Payouts', 'Surrender', 
	  'Reserves', 'Dispute', 'Benefic', 'Warrens', 'Agented', 'Payable', 'Filing', 
	  'Underw', 'Trustee', 'Waivers', 'Assured', 'Assets', 'Revised', 'Adjusts', 
	  'Obligee', 'Retired', 'Examine', 'Negated', 'Liables', 'Client', 'Rewards', 
	  'Witness', 'Reentry', 'Mortise', 'Sectors', 'Facilit'
    ]),
    suicidal: new Glossary([
      'Underway', 'Insurers', 'Premiums', 'Liability', 'Claimant', 'Reinsured', 'Coverage', 
	  'Benefici', 'Adjuster', 'Disputed', 'Contract', 'Deducted', 'Retention', 'Assurance', 
	  'Insureds', 'Settling', 'Endorsed', 'Waiverss', 'Reentrys', 'Trustees', 'Obligors', 
	  'Agentship', 'Faciliti', 'Surrender', 'Investment', 'Mortgages', 'Payouts', 'Expiration', 
	  'Reviewee', 'Payments', 'Holderss', 'Escrowed', 'Financed', 'Retained', 'Cancelled', 
	  'Underly', 'Pledgors', 'Proposed', 'Adjustes', 'Appraise'
    ]),
	critical: new Glossary([
      'Contingencies', 'Underwriters', 'Reassessment', 'Comprehensives', 'Accountability', 
	  'Conventional', 'Reinsurance', 'Compensations', 'Appraisements', 'Indemnification', 
	  'Professionalism', 'Disproportionate', 'Documentation', 'Proportionality', 'Nonrenewables', 
	  'Subcontractors', 'Superannuation', 'Representation', 'Exclusivity', 'Uncontestedness', 
	  'Liquidation', 'Accreditation', 'Contractual', 'PropertyDamage', 'ValuationMethods', 
	  'Self-insuring', 'Misrepresentation', 'Responsibility', 'Standardization', 'Dissemination'
    ])
  };

  /**
   * Updates the current glossary being used based on your current level
   */
  game.updateGlossary = function() {
    // Increase the difficulty after every 5 points earned by the player
    if (this.scoreNum !== 0 && this.scoreNum % 5 === 0) {
      this.levelUp();
    }

    var glossaries = this.glossaries;

    // Choose the glossary based on the current level
    switch (this.level) {
      case 0:  this.currentGlossary = glossaries.veryEasy; break;
      case 1:  this.currentGlossary = glossaries.easy;     break;
      case 2:  this.currentGlossary = glossaries.medium;   break;
      case 3:  this.currentGlossary = glossaries.hard;     break;
      case 4:  this.currentGlossary = glossaries.insane;   break;
      case 5:  this.currentGlossary = glossaries.suicidal; break;
	  default: this.currentGlossary = glossaries.critical; break;
    }
  };

  /**
   * Returns the correct answer for the current word
   */
  game.getCorrectChoice = function(word) {
    var output;

    do {
      output = StringLib.shuffle(word);
    } while (output === word);

    return output;
  };

  /**
   * Returns an incorrect answer for the current word
   */
  game.getIncorrectChoice = function(word) {
    var output;

    do {
      output = StringLib.replaceLetter(word);
    } while (StringLib.isCorrect(output, game.correctButton.innerHTML));

    return StringLib.shuffle(output);
  };

  /**
   * Removes the previous word used and updates the remaining word count of the glossary
   */
  game.removePrevWord = function() {
    var prevWord = this.currentWord.innerHTML;

    // Remove the previous word from the current glossary
    this.currentGlossary.removeWord(prevWord);
  };

  /**
   * Updates the current word with a random word from the current glossary
   */
  game.updateWord = function() {
    // Remove the previous word that was used from the current glossary
    this.removePrevWord();

    // Update the current word to a random word from the current glossary
    this.currentWord.innerHTML = this.currentGlossary.randWord();
  };

  /**
   * Assigns the correct and incorrect choices to each button
   */
  game.updateButtons = function() {
    // Index used with for-loops
    var i;

    // Choose a random button to hold the correct choice
    this.correctButton = this.buttons[Math.floor(Math.random() * 4)];
    this.correctButton.innerHTML = game.getCorrectChoice(this.currentWord.innerHTML);

    // Give the rest of the buttons incorrect choices
    for (i = 0; i < this.buttons.length; i++) {
      if (this.buttons[i] === this.correctButton) { continue; }
      this.buttons[i].innerHTML = game.getIncorrectChoice(this.currentWord.innerHTML);
    }

    // Add event handlers to each button
    for (i = 0; i < this.buttons.length; i++) {
      this.buttons[i].addEventListener('click', this.clickHandler);
    }
  };

  /**
   * Starts the countdown timer
   */
  game.displayTimer = function() {
    // Clear the previous timer
    clearInterval(game.timer);
    game.timer = setInterval(function() {
      if (game.millsecondsLeft === 0) {
        // If the timer reaches zero, clear the timer and end the game
        clearInterval(game.timer);
        game.over();
      } else {
        game.millsecondsLeft--;
      }
      var time = document.getElementById('timer');
      time.innerHTML = (game.millsecondsLeft / 100).toFixed(2);
    }, 10);
  };

  /**
   * Resets the countdown timer
   */
  game.resetTimer = function() {
    game.millsecondsLeft = 500;
  };

  /**
   * Handler for pressing the correct and incorrect buttons
   */
  game.clickHandler = function(event) {
    var clickedButton = event.target;
    if (clickedButton === game.correctButton) {
      game.resetTimer();
      game.updateScore();
      game.removePrevWord();
      game.render();
    } else {
      game.over(clickedButton);
    }
  };

  /**
   * Increments the current level by 1
   */
  game.levelUp = function() {
    this.level++;
  };

  /**
   * Increments the current score by 1
   */
  game.updateScore = function() {
    this.scoreNum++;
    if (this.scoreNum.toString().length < 2) {
      this.scoreNum = '0' + this.scoreNum;
    }
    this.score.innerHTML = 'Score: ' + this.scoreNum;
  };

  /**
   * Displays the loss screen
   */
  game.displayLossScreen = function() {
    // Display the loss screen
    game.lossScreen.style.opacity = '1';
    game.lossScreen.style.zIndex = '10';

    // Display the final score
    game.finalScore.innerHTML = game.scoreNum;

    // Add event handler to the reset button
    game.resetButton.addEventListener('click', function() {
      window.location = 'anagrams.html';
    });
  };

  /**
   * Ends the game
   */
  game.over = function(clickedButton) {
    // Stop the timer
    game.millsecondsLeft = 0;

    // Disable all of the buttons by removing their event handlers
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].removeEventListener('click', this.clickHandler);
    }

    // If a wrong choice was made, show their incorrect choice in red
    if (clickedButton) {
      clickedButton.style.background = 'red';
      clickedButton.style.border = 'red';
    }

    // Show the correct answer in green
    this.correctButton.style.background = 'green';
    this.correctButton.style.borderWidth = '2px';

    // Display the loss screen
    setTimeout(game.displayLossScreen, 1500);
  };

  /**
   * Renders the current word and button choices
   */
  game.render = function() {
    this.updateGlossary();
    this.updateWord();
    this.updateButtons();
    this.displayTimer();
  };

  // Start the game
  game.render();
})(StringLib);
