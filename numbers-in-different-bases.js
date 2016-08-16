// initializing variables 
{
    // used to place graphics in proper place on canvas
    var CANVASWIDTH = 600;
    var CANVASHEIGHT = 400;
    var PADDING = 10;
    var LEGENDWIDTH= 35;
    var LEGENDHEIGHT = 400;
    var VALUEWIDTH = 160;
    var BASEWIDTH = 80;
    var BLOCKWIDTH = 70;
    var NUMBLOCKS = 5;
    var BUTTONWIDTH = 150;
    var BLOCKHEIGHT = 84;
    var YPOS = 30;
    // used to label legend + blocks
    var digits = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    var exponents = ['⁰', '¹', '²', '³', '⁴', '⁵'];
    // fonts and colors
    var f = createFont("monospace");
    textFont(f);
    colorMode(HSB);
    var WHITE = color(0, 0, 255);
    var BLACK = color(0,0,0);
    var GREEN = color(80,255, 230);
    var RED = color(0, 143, 129);
    var OUTLINEGRAY = color(279, 1, 140);
    var MAXSAT = 255;
    // to keep loop at violet rather than back to red
    var MAXHUE = 200;
    // to store the colors in HSB for clicking through
    var colorArray = [];
    // have to initialize background now to override from default
    background(WHITE);
}

// which mode of the game
var Goal = null;
// labels used to hold header and content
var numHolder = function(config) 
{
    this.x = config.x;
    this.y = config.y;
    this.width = config.width ||VALUEWIDTH;
    this.height = config.height||60;
    this.value = config.value;
};

var basebox = new numHolder
({
    x : (CANVASWIDTH - LEGENDWIDTH - BASEWIDTH)/2,
    y: 329,
    width : BASEWIDTH,
    value: 2
});

var valuebox = new numHolder
({
    x: BLOCKWIDTH * 6 - PADDING,
    y: YPOS,
    height: 80,
    value: 0
});
// create based on how many are needed (will be same # as
var createColorArray = function(baseNum)
{
    // first, make sure old values wiped out
    colorArray.length = 0;
    var colorInterval = MAXHUE/(baseNum - 1);
    for(var i = 0; i <= MAXHUE + 1; i += colorInterval)
    {
        colorArray.push(color(i, MAXSAT, MAXSAT));
    }
};

var legend = function(baseNum)
{
    var blockHeight = LEGENDHEIGHT/baseNum;
    for(var i = 0, index = 0; i < LEGENDHEIGHT; i+= blockHeight, index++)
    {
        // create a rectangle w/ color and la
        fill(colorArray[index]);
        strokeWeight(0);
        noStroke();
        rect(CANVASWIDTH - LEGENDWIDTH, i, CANVASWIDTH, blockHeight);
        // text labeling each element of the legend
        textAlign(CENTER, CENTER);
        fill(BLACK);
        // calculate proper text size for label
        textSize(14 + 16/baseNum);
        text(digits[index],CANVASWIDTH - (LEGENDWIDTH/2), i + blockHeight/2);
    }
};
// object for each number block
var Placeholder = function(config) 
{
    this.x = config.x;
    this.y = YPOS;
    this.width = config.width || BLOCKWIDTH;
    this.height = config.height || BLOCKHEIGHT;
    this.multiplier = config.multiplier || 0;
    this.on = true; 
    this.value = config.value;
    this.index = config.index;
    this.onClick = config.onClick;
};
Placeholder.prototype.drawArrow = function(isTop, arrowColor)
{
    stroke(WHITE);
    strokeWeight(3);
    fill(arrowColor);
    if (isTop)
    {
        //top triangle
        triangle(this.x + this.width/2, this.y - 2*PADDING, 
                 this.x + PADDING/4, this.y - PADDING/2,
                 this.x + this.width - PADDING/4, this.y - PADDING/2);
    }
    else
    {
        triangle(this.x + this.width/2, this.y + this.height + 2*PADDING, 
                 this.x + PADDING/4, this.y + this.height + PADDING/2,
                 this.x + this.width - PADDING/4, this.y + this.height + PADDING/2                  );
    }
};
Placeholder.prototype.update = function()
{
    noStroke();
    fill(colorArray[this.multiplier]);
    rect(this.x, this.y, this.width, this.height, 5);
    fill(BLACK);
    // add label within placeholder
    textSize(40);
    textAlign(CENTER, CENTER);
    text(digits[this.multiplier], this.x + this.width/2, this.y + this.height/2);
    // add up arrow if possible
    if(this.multiplier < basebox.value - 1)
    {
        this.drawArrow(true, colorArray[this.multiplier + 1]);
    }
    // else, wipe out existing arrow
    else
    { 
        this.drawArrow(true, WHITE);
    }
    // add down arrow if possible
    if(this.multiplier > 0)
    {
        this.drawArrow(false, colorArray[this.multiplier - 1]);
    }
    // else, wipe out existing arrow
    else
    {
        this.drawArrow(false, WHITE);
    }
};

// control whether user is mousing over block itself
Placeholder.prototype.isMouseInsideMain = function()
{
    return mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY > this.y &&
           mouseY < (this.y + this.height);
};
// control whether user is mousing over top arrow
Placeholder.prototype.isMouseInsideTop = function()
{
    // rather than making sure user is clicking exactly inside the triange
    // simply returns whether user is in rectangle above block
    return mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY < this.y - PADDING/4;
};
// control whether user is mousing over bottom arrow
Placeholder.prototype.isMouseInsideBottom = function()
{
    return mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY > this.y + this.height + PADDING/4 &&
           mouseY < this.y + this.height + 2*PADDING;
};
// action of button
Placeholder.prototype.handleMouseClick = function()
{
    if (this.isMouseInsideMain())
    {
        this.multiplier++;
        if(this.multiplier >= basebox.value)
        {
            this.multiplier = 0;
        }
    }
    else
    {
        // if top arrow is there
        if (this.multiplier < basebox.value - 1)
        {
            if (this.isMouseInsideTop())
            {
                this.multiplier++;
            }
        }
        // if bottom arrow is there
        if (this.multiplier > 0)
        {
            if(this.isMouseInsideBottom())
            {
                this.multiplier --;
            }
        }
    }
    this.update();
};
var PlaceholderArray = [];
var blocksToNum = function()
{
    var count = 0;
    for (var i = 0, n = PlaceholderArray.length; i < n; i++)
    {
        count += parseInt(PlaceholderArray[i].multiplier, 10) * 
                 parseInt(PlaceholderArray[i].value, 10);
    }
    return count;
};
var numToBlocks = function(number)
{
    var index = PlaceholderArray.length - 1;
    while(index >= 0)
    {
        var counter = 0;
        while (number >= PlaceholderArray[index].value)
        {
            number -=PlaceholderArray[index].value;
            counter++;
        }
        PlaceholderArray[index].multiplier = counter;
        PlaceholderArray[index].update();
        index --;
    }
}; 
var initBlocks = function()
{
    // clear placeholder array
    PlaceholderArray.length = 0;
    // make blocks right oriented (so can start w/ 0)
    for (var i = (BLOCKWIDTH) * 5 - PADDING*2, index = 0; 
         i > 0; i -= BLOCKWIDTH + PADDING, index++)
    {
        var temp = new Placeholder({});
        temp.x = i;
        temp.value = pow(basebox.value, index);
        temp.index = index;
        temp.multiplier = 0;
        temp.draw();
        PlaceholderArray.push(temp);
    }
    // update valuebox
    numToBlocks(valuebox.value);
};
var setUpBase = function(base)
{
    createColorArray(base);
    initBlocks();
    legend(base);
};
// draw white inside box and print value
numHolder.prototype.update = function()
{
    // white content box
    noStroke();
    fill(WHITE);
    rect(this.x + PADDING/2 , this.y + PADDING/2, 
      this.width - PADDING, this.height - PADDING);
    // contents of variable
    fill(BLACK);
    textAlign(CENTER, CENTER);
    // find what the textSize should be
    this.value = this.value.toString();
    var wordwidth = this.value.length;
    // ensure that shorter numbers don't cause major overflow
    if (wordwidth < 4)
    {
        wordwidth = 4;
    }
    textSize(this.width/wordwidth);
    // centering text within box
    text(this.value,
             this.x + this.width/2, this.y + this.height/2);
    // put equal sign
    textSize(54);
    fill(BLACK);
    text("=", BLOCKWIDTH * 6 ,  YPOS + BLOCKHEIGHT/2);
};


// adds vertical arrows
valuebox.addVArrows = function()
{
    fill(OUTLINEGRAY);
    noStroke();
    triangle(this.x + this.width/2, this.y - PADDING, 
            this.x + 5*PADDING, this.y + PADDING/4,
            this.x + this.width - 5*PADDING, this.y + PADDING/4);
    triangle(this.x + this.width/2, this.y + this.height + PADDING, 
            this.x + 5*PADDING, this.y + this.height - PADDING/4,
            this.x + this.width - 5*PADDING, this.y + this.height - PADDING/4);
};

valuebox.isWithinTopArrow = function()
{
    return mouseX > this.x + 5*PADDING &&
           mouseX < this.x + this.width - 5*PADDING &&
           mouseY > this.y - PADDING &&
           mouseY < this.y + PADDING/4;
};
valuebox.isWithinBottomArrow = function()
{
     return mouseX > this.x + 5*PADDING &&
           mouseX < this.x + this.width - 5*PADDING &&
           mouseY < this.y + this.height + PADDING &&
           mouseY > this.y + this.height - PADDING/4;
};
valuebox.handleMouseClick = function()
{
    // make sure number doesn't go above what we can represent
    if(this.isWithinTopArrow() &&
       this.value < (pow(basebox.value, NUMBLOCKS) - 1))
    {
        this.value++;
        numToBlocks(this.value);
    }
    else if(this.isWithinBottomArrow() && this.value > 0)
    {
        this.value--;
        numToBlocks(this.value);
    }
};
basebox.addHArrows = function()
{
    fill(OUTLINEGRAY);
    noStroke();
    strokeWeight(2);
    // left triangle
    triangle(this.x - PADDING/2, this.y + this.height/2, 
             this.x + PADDING, this.y + PADDING*(4/3),
             this.x + PADDING, this.y + this.height - PADDING*(4/3));
    // right triangle 
    triangle(this.x + this.width + PADDING/2, this.y + this.height/2, 
             this.x + this.width - PADDING, this.y + PADDING*(4/3),
             this.x + this.width - PADDING, this.y + this.height - PADDING*(4/3             ));
    // redraw white box over arrow edges
    this.update();
};
basebox.isWithinLeftArrow = function()
{
    return mouseX > this.x - PADDING/2 &&
           mouseX < this.x + PADDING &&
           mouseY > this.y + PADDING*(4/3) &&
           mouseY < this.y + this.height - PADDING*(4/3);
};
basebox.isWithinRightArrow = function()
{
    return mouseX > this.x + this.width - PADDING/2 &&
           mouseX < this.x + this.width + PADDING &&
           mouseY > this.y + PADDING*(4/3) &&
           mouseY < this.y + this.height - PADDING*(4/3);
};
basebox.handleMouseClick = function()
{
    if(this.isWithinRightArrow() && this.value < 16)
    {
        this.value++;
    }
    // make sure if incrementing down, can represenet that number in a lower base
    else if(this.isWithinLeftArrow() &&
            this.value > 2 && 
            (valuebox.value <= pow(this.value - 1, NUMBLOCKS)))
    {
        this.value--;
    }
    this.update();
    setUpBase(this.value);
    initBlocks();
};
// button used for changebase
var Button = function(config)
{
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 63;
    this.height = config.height || 30;
    this.color = config.color;
    this.label = config.label || "Click";
    this.onClick = config.onClick || function() {};
    this.on = config.on;
};
// actually draw the button on canvas
Button.prototype.draw = function() 
{
    noStroke();
    fill(this.color);
    rect(this.x, this.y, this.width, this.height, 5);
    fill(BLACK);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.width/2, this.y + this.height/2);
};

// if button needs to be erased
Button.prototype.override = function() {
    fill(WHITE);
    rect(this.x, this.y, this.width, this.height, 5);
};
// control whether user is mousing over button
Button.prototype.isMouseInside = function()
{
    return mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY > this.y &&
           mouseY < (this.y + this.height);
};

Button.prototype.handleMouseClick = function()
{
    if (this.isMouseInside())
    {
        this.on = !this.on;
        if(this.on)
        {
            this.color = GREEN;
        } 
        else
        {
            this.color = OUTLINEGRAY;
        }
        this.draw();
        // now, actually change all the labels 
        for (var i = 0, n = PlaceholderArray.length; i < n; i++)
        {
            PlaceholderArray[i].draw();
        }
        // if additional function exists, call it
        if( typeof this.extra === "function")
        {
            this.extra();
        }
    }
};

var gameMode = new Button
({
    x : CANVASWIDTH - BUTTONWIDTH - LEGENDWIDTH - PADDING,
    y : 320,
    width : BUTTONWIDTH + PADDING*(2/3),
    label : "GAME MODE",
    color : OUTLINEGRAY,
});

var removeGameMode = function()
{
     // wipe out target text
    stroke(WHITE);
    strokeWeight(4);
    fill(WHITE);
    rect(gameMode.x, gameMode.y - gameMode.height,
         gameMode.width, gameMode.height);
    Goal = null;
    gameMode.color = OUTLINEGRAY;
    gameMode.draw();
};
gameMode.setGoal = function()
{
    // if goal not set
    if(Goal === null)
    {
        do
        {
            Goal = floor(random(1, pow(basebox.value, NUMBLOCKS) -1));
        } 
        while(Goal === valuebox.value);
        // show the label above button
        fill(BLACK);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("Target: " + Goal, this.x + this.width/2, this.y - this.height/2);
        // change color of button itself
        this.color = GREEN;
    }
    else
    {
        // wipe out target text
        removeGameMode();
    }
};
gameMode.handleMouseClick = function()
{
    if (this.isMouseInside())
    {
        gameMode.setGoal();
        this.draw();
    }
};
var explanations = new Button
({
    x : CANVASWIDTH - BUTTONWIDTH - LEGENDWIDTH -PADDING,
    y : 360,
    label : "EXPLAIN",
    width : BUTTONWIDTH/2,
    color : OUTLINEGRAY,
    on : false,
});
var labels = new Button
({
    x : CANVASWIDTH - BUTTONWIDTH/2 - LEGENDWIDTH - PADDING/2 ,
    y : 360,
    label : "LABELS",
    color : GREEN,
    width : BUTTONWIDTH/2,
    on : true,
});
var reset = new Button
({
    x : 0,
    y : 360,
    label : "RESET",
    color : RED,
    width : BUTTONWIDTH/2,
    on: true,
});
reset.handleMouseClick = function()
{
    if(this.isMouseInside())
    {
        valuebox.value = 0;
        numToBlocks(valuebox.value);
        valuebox.update();
    }
};
// make it so explain button doesn't show if labels is off
labels.extra = function()
{
    if(!this.on)
    {
        explanations.override();
    }
    else
    {
        explanations.draw();
    }
};
Placeholder.prototype.draw = function() {
    // wipe out existing letters if there
    fill(WHITE);
    rect(this.x, this.y + this.height + PADDING, this.width, PADDING*10);
    if(labels.on)
    {
        fill(BLACK);
        // add label below to show what digit this is
        textSize(22);
        text(this.value, this.x + this.width/2, this.y + this.height + PADDING*4);
        // if explanations, clarify how value got there
        if(explanations.on)
        {
            fill(OUTLINEGRAY);
            textSize(18);
            text(basebox.value + exponents[this.index],
                 this.x + this.width/2, this.y + this.height + PADDING*6);
        }
    }
    this.update();
};

var coord = function(config)
{
    this.x = config.x;
    this.y = config.y;
    this.speed = config.speed;
};
var StarPositions = [];
// generate 30 random star positions
var initStars = function()
{
    for (var i = 0; i < 120; i++)
    {
        var temp = new coord({});
        temp.x = random(0, CANVASWIDTH - LEGENDWIDTH);
        temp.y = random(-200, CANVASHEIGHT);
        temp.speed = random(3,8);
        StarPositions.push(temp);
    }
    
};
var createScreen = function()
{    // let's wipe the background, and then redraw important parts every time?
    background(WHITE);
    gameMode.draw();
    setUpBase(basebox.value);
    valuebox.addVArrows();
    valuebox.value = blocksToNum();
    valuebox.update();
    basebox.update();
    basebox.addHArrows();
    explanations.draw();
    labels.draw();
    reset.draw();
};
var stars = function() 
{
    // let's wipe the background, and then redraw important parts every time?
    createScreen();
    for (var i = 0; i < StarPositions.length; i++)
    {
        image((getImage ("cute/Star")),
              StarPositions[i].x, StarPositions[i].y, 30, 50);
        if (StarPositions[i].y > 400) 
        {
            StarPositions.splice(i, 1);
        } 
        else 
        {
            StarPositions[i].y += StarPositions[i].speed;
        }
    }
    if (StarPositions.length === 0)
    {
        initStars();
        // set off game mode
        removeGameMode();
    }
};
createScreen();
initStars();
var draw = function() {
      // if goal is correct
      if(parseInt(valuebox.value, 10) === Goal)
      {
          stars();
      }
      else
      {
            mouseClicked = function() 
            {
                for(var i = 0, n = PlaceholderArray.length; i < n; i++)
                {
                    PlaceholderArray[i].handleMouseClick();
                }
                valuebox.handleMouseClick();
                valuebox.value = blocksToNum();
                valuebox.update();
                // only allow base to change if not in game mode
                if(Goal === null)
                {
                    basebox.handleMouseClick();
                }
                labels.handleMouseClick();
                gameMode.handleMouseClick();
                reset.handleMouseClick();
                if(labels.on)
                {
                    explanations.handleMouseClick();
                }
            };
      }
};
