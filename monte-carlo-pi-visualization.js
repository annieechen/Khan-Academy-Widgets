// change these if you're changing size of canvas
// NOTE: changing anything but SQUARELENGTH will require adjusting of buttons + labels
var CANVASWIDTH = 600;
var CANVASHEIGHT = 400;
// initialize constants so I don't get dinged for bad design ;)
var SQUARELENGTH = 360;
var SQUARELENGTHUNITS = 2;
var xSQUARE = 0;
var ySQUARE = 0;
var xCIRCLECENTER = xSQUARE + SQUARELENGTH/2;
var yCIRCLECENTER = ySQUARE + SQUARELENGTH/2;
var CIRCLERADIUS = SQUARELENGTH/2;

// for labels + buttons
var PADDING = 8;
// Colors used 
var GREEN = color(56, 250, 8);
var RED = color(255, 0, 0);
var WHITE = color(255, 255, 255);
var BLACK = color(0, 0, 0);
var BLUE = color(30, 0, 255);
var ORANGE = color(255, 140, 0);
var PURPLE = color(187, 4, 224);

// globals to keep count of # of dots
var dotsInsideNum = 0;
var dotsOutsideNum = 0;
var dotsTotalNum = 0;

// controls RUN/STOP button
var isRunning = false;
var runButtonColor = GREEN;
var runButtonMessage = "RUN";

// objects
// button used for add dot and run
var Button = function(config)
{
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 150;
    this.height = config.height || 50;
    this.color = config.color;
    this.label = config.label || "Click";
    this.onClick = config.onClick || function() {};
};
// actually draw the button on canvas
Button.prototype.draw = function() 
{
    noStroke();
    fill(this.color);
    rect(this.x, this.y, this.width, this.height, 5);
    fill(0, 0, 0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.width/2, this.y + this.height/2);
};
// control whether user is mousing over button
Button.prototype.isMouseInside = function()
{
    return mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY > this.y &&
           mouseY < (this.y + this.height);
};
// action of button
Button.prototype.handleMouseClick = function() {
    if (this.isMouseInside())
    {
        this.onClick();
    }
};
// labels used to hold header and content
var Label = function(config) 
{
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
    this.label = config.label;
    this.color = config.color;
    // defaults to 15, but can be changed
    this.textSize = config.textSize || 15;
};
// draw the box on the outside and header 
Label.prototype.draw = function()
{
     strokeWeight(0);
     noStroke();
     // initialize outside      
     fill(this.color);
     rect(this.x, this.y, this.width, this.height, 5);
     // label of box
     fill(BLACK);
     textSize(this.textSize);
     textAlign(CENTER, CENTER);
     text(this.label, this.x + this.width/2, this.y + this.height/4);
};
// draw white inside box and print value
Label.prototype.update = function(value)
{
    // white content box
    noStroke();
     fill(WHITE);
     rect(this.x + PADDING/2 , this.y + this.height/2 - PADDING/2, 
          this.width - PADDING, this.height/2, 5);
     // contents of variable
     fill(BLACK);
     textAlign(CENTER, CENTER);
     textSize(this.textSize);
     // centering text within box
    text(value,
             this.x + this.width/2,  this.y + this.height*(3/4) - PADDING/2);
};

var dotsInLabel = new Label
({
    x : SQUARELENGTH + PADDING,
    y : 10,
    width : (CANVASWIDTH - 25 - SQUARELENGTH)/3,
    height : 60,
    label : "Inside",
    color : GREEN,
});

var dotsOutLabel = new Label
({
    x : SQUARELENGTH + (CANVASWIDTH - SQUARELENGTH)/3 + PADDING/2,
    y : 10,
    width : (CANVASWIDTH - 25 - SQUARELENGTH)/3,
    height : 60,
    label : "Outside",
    color : RED,
});

var dotsTotalLabel = new Label
({
    x : SQUARELENGTH + 2 * (CANVASWIDTH - SQUARELENGTH)/(3) + PADDING/8,
    y : 10,
    width : (CANVASWIDTH - 25 - SQUARELENGTH)/3,
    height : 60,
    label : "Total",
    color : BLUE,
});

var squareAreaLabel = new Label
({
    x : SQUARELENGTH + PADDING,
    y : 125,
    width : (CANVASWIDTH - SQUARELENGTH - PADDING*2),
    height : 45,
    label : "Area of Square",
    color : BLUE,
});

var circleAreaLabel = new Label
({
    x : SQUARELENGTH + PADDING,
    y : 75,
    width : (CANVASWIDTH - SQUARELENGTH - PADDING*2),
    height : 45,
    label : "Area of Circle",
    color : GREEN,
});

// hard coded in the purple box with formulas, because only one on the canvas
var formulaBox = function()
{
    fill(WHITE);
    stroke(PURPLE);
    strokeWeight(4);
    var formulaBoxWidth = CANVASWIDTH - SQUARELENGTH - PADDING*2;
    var formulaBoxHeight = 45;
    rect(SQUARELENGTH + PADDING, 178, 
         formulaBoxWidth, formulaBoxHeight, 5);
    fill(BLACK);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    // fraction contents
    text("Circle Area", 
        SQUARELENGTH + (formulaBoxWidth/6) + PADDING*2, 185 + formulaBoxHeight/4);
    text("Square Area", 
        SQUARELENGTH + (formulaBoxWidth/6) + PADDING*2, 185 + formulaBoxHeight/(3/2));
    text("π", 
        SQUARELENGTH + (formulaBoxWidth/2) + PADDING*2, 185 + formulaBoxHeight/3 - PADDING/2);
    text("4", 
        SQUARELENGTH + (formulaBoxWidth/2) + PADDING*2, 185 + formulaBoxHeight/(3/2) + PADDING/2);
    text("Inside", 
        SQUARELENGTH + formulaBoxWidth/(6/5) + PADDING, 185 + formulaBoxHeight/3 - PADDING/2);
    text("Total", 
        SQUARELENGTH + formulaBoxWidth/(6/5) + PADDING, 185 + formulaBoxHeight/(3/2) + PADDING/2);
    // divider bars
    strokeWeight(1);
    stroke(BLACK);
    line(SQUARELENGTH + PADDING*3, 185 + formulaBoxHeight/3, 
         SQUARELENGTH + formulaBoxWidth/3 + PADDING, 185 + formulaBoxHeight/3);
    line(SQUARELENGTH + formulaBoxWidth/2, 185 + formulaBoxHeight/3, 
         SQUARELENGTH + formulaBoxWidth/(3/2) - PADDING, 185 + formulaBoxHeight/3);
    line(SQUARELENGTH + formulaBoxWidth/(3/2) + PADDING*3, 185 +formulaBoxHeight/3,
         SQUARELENGTH + formulaBoxWidth - PADDING, 185 + formulaBoxHeight/3);
    // equal signs
    textSize(18);
    textAlign(CENTER, CENTER);
    text("=", 
        SQUARELENGTH + formulaBoxWidth/3 + PADDING*3, 185 + formulaBoxHeight/3);
    text("=", 
        SQUARELENGTH + formulaBoxWidth/2 + PADDING*6, 185 + formulaBoxHeight/3);
};
var piLabel = new Label
({
    x : SQUARELENGTH + PADDING,
    y : 230, 
    width : (CANVASWIDTH - SQUARELENGTH - PADDING*2),
    height : 120,
    label : "π ≈ 4 * (Inside / Total) ",
    color : PURPLE,
    textSize :22,
});
// line through circle that marks radius
var labelRadius = function()
{
    stroke(PURPLE);
    // mark center
    strokeWeight(8);
    point(xCIRCLECENTER,yCIRCLECENTER);
    // mark edge
    point(SQUARELENGTH, yCIRCLECENTER);
    strokeWeight(2);
    line(xCIRCLECENTER, yCIRCLECENTER,
         SQUARELENGTH, yCIRCLECENTER);
    textAlign(CENTER, TOP);
    textSize(12);
    text("Circle's Radius  = " + SQUARELENGTHUNITS/2 + " unit ", 
         SQUARELENGTH * (3/4), yCIRCLECENTER + PADDING/2);
};
// bracket at bottom of square that marks side length
var labelSquareSide = function()
{
    // draw unit measure label
    strokeWeight(2);
    stroke(PURPLE);
    strokeCap(SQUARE);
    // left vertical line
    line(PADDING/2, SQUARELENGTH + PADDING/2,
         PADDING/2, CANVASHEIGHT - PADDING*3);
    // middle line
    line(PADDING/2, CANVASHEIGHT - PADDING*3,
         SQUARELENGTH - PADDING/2, CANVASHEIGHT - PADDING*3);
    // right vertical line
    line(SQUARELENGTH - PADDING/2, SQUARELENGTH + PADDING/2,
         SQUARELENGTH - PADDING/2, CANVASHEIGHT - PADDING*3);
    // label unit length
    fill(BLACK);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    text("Square's sides = " + SQUARELENGTHUNITS + " units", 
         SQUARELENGTH/2, CANVASHEIGHT - PADDING);
};

// return whether an (x,y) coordinate is within the bounds of the square
var isWithinSquare = function(x,y)
{
    return  x >= xSQUARE &&
            y >= ySQUARE &&
        x <= (xSQUARE + SQUARELENGTH) &&
        y <= (ySQUARE + SQUARELENGTH);
        
};
// return whether an (x,y) coordinate is within the bounds of the circle
var isWithinCircle = function(x,y)
{
    // find distance from radius
    // using pythagorean theorum ;) (practical applications of alg 1!)
    var distance = sqrt(sq(x - xCIRCLECENTER) + sq(y - yCIRCLECENTER));
    return (distance <= CIRCLERADIUS);
};

// must only be passed in (x,y) coordinates within the square, doesn't check for that
var addDot = function(x,y)
{
    dotsTotalNum ++;
    dotsTotalLabel.update(dotsTotalNum);
    // let's change colors depending on whether within circle
    if (isWithinCircle(x,y))
    {
        dotsInsideNum++;
        dotsInLabel.update(dotsInsideNum);
        stroke(GREEN);
    }
    else 
    {
        dotsOutsideNum++;
        dotsOutLabel.update(dotsOutsideNum);
        stroke(RED);
    }
    // actually put the point on the cavas
    strokeWeight(6);
    point(x,y);
    // converting to string to show exactly 5 decimal places
    var pi = 4.0000 * (dotsInsideNum/dotsTotalNum);
    var piDec = pi.toFixed(5);
    piLabel.update(piDec);
};
// generates a random (x,y) point within the square, and then calls addDot
var randomDot = function()
{
    var xPos = Math.random() * (SQUARELENGTH - xSQUARE + 1) + xSQUARE;
    var yPos = Math.random() * (SQUARELENGTH - xSQUARE + 1) + xSQUARE;
    addDot(xPos, yPos);
};

var RandomButton = new Button
({
    x : SQUARELENGTH + 10,
    y : CANVASHEIGHT - 40,
    width : (CANVASWIDTH - (PADDING*3)  - SQUARELENGTH)* (1/2),
    height: 35,
    label: "ADD DOT",
    color : PURPLE,
    onClick: function() {
        randomDot();
    }
});

// determines run/stop of runButton
var changeRunState = function()
{
    isRunning = !isRunning;
    if(isRunning)
    {
        runButtonColor = RED;
        runButtonMessage = "STOP";
    } 
    else
    {
        runButtonColor = GREEN;
        runButtonMessage = "RUN";
    }
};
var RunButton = new Button
({
    x : SQUARELENGTH + 10 + (CANVASWIDTH - 20 - SQUARELENGTH)*(1/2) + PADDING/3,
    y : CANVASHEIGHT - 40,
    width : (CANVASWIDTH - 20 - SQUARELENGTH)/4 - PADDING,
    height: 35,
    label: "RUN",
    color : GREEN,
    onClick: function() {
        // turning run to on
        changeRunState();
        this.color = runButtonColor;
        this.label = runButtonMessage;
        RunButton.draw();
    }
});
var initBoard = function() 
{
    // need a bigger white square first to be able to erase dots on the edge
    noFill();
    stroke(WHITE);
    strokeWeight(5);
    rect(xSQUARE, ySQUARE, SQUARELENGTH, SQUARELENGTH);
    // draw square and circle
    fill(WHITE);
    stroke(BLACK);
    strokeWeight(1);
    rect(xSQUARE, ySQUARE, SQUARELENGTH, SQUARELENGTH);
    ellipse(xCIRCLECENTER, yCIRCLECENTER, CIRCLERADIUS * 2, CIRCLERADIUS * 2);
    // give measurements
    labelSquareSide();
    labelRadius();
    // set all values to 0
    dotsInsideNum = 0;
    dotsOutsideNum = 0;
    dotsTotalNum = 0;
    dotsInLabel.update(dotsInsideNum);
    dotsOutLabel.update(dotsOutsideNum);
    dotsTotalLabel.update(dotsTotalNum);
    piLabel.update(0);
};

var ClearButton = new Button
({
    x : SQUARELENGTH + 10 + (CANVASWIDTH - 20 - SQUARELENGTH)*(3/4),
    y : CANVASHEIGHT -40,
    width : (CANVASWIDTH - 20 - SQUARELENGTH)/4 + PADDING/2,
    height: 35,
    label: "CLEAR",
    color : ORANGE,
    onClick: function() {
        initBoard();
    }
    
});
var initLabels = function()
{
    // initialize labels
    dotsInLabel.draw();
    dotsInLabel.update(dotsInsideNum);
    dotsOutLabel.draw();
    dotsOutLabel.update(dotsOutsideNum);
    dotsTotalLabel.draw();
    dotsTotalLabel.update(dotsTotalNum);
    piLabel.draw();
    piLabel.update(0);
    // initialize buttons
    RandomButton.draw();
    RunButton.draw();
    ClearButton.draw();
    // initialize formula explanations
    squareAreaLabel.draw();
    squareAreaLabel.update("side² = 2² = 4 units²");
    circleAreaLabel.draw();
    circleAreaLabel.update("π r² = π * 1² =  π units²");
    formulaBox();
};


initBoard();
initLabels();
var draw = function() {
     // click to add points
    if(isRunning)
    {
         randomDot();
    }
     mouseClicked = function() {
         RandomButton.handleMouseClick();
         RunButton.handleMouseClick();
         ClearButton.handleMouseClick();
         // will need conditions to limit the canvas
         if(mouseIsPressed && isWithinSquare(mouseX, mouseY))
         {
             addDot(mouseX, mouseY);
         }
     };
};


