// can be viewed at https://www.khanacademy.org/computer-programming/numbers-in-different-bases-visualization/5886855988772864
var CANVASWIDTH = 600;
var CANVASHEIGHT = 400;
var PADDING = 15;

var LEGENDWIDTH= 60;
var VALUEWIDTH = 192;
var BLOCKWIDTH = 91;
var base = 10;
// can support up to base 16
var digits = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G'];

var f = createFont("monospace");
textFont(f);

colorMode(HSB);
var WHITE = color(0, 0, 255);
var BLACK = color(0,0,0);
var OUTLINEGRAY = color(302, 40, 250);
background(WHITE);
var MAXSAT = 255;
// to keep loop at violet rather than back to red
var MAXHUE = 200;
// to store the colors in HSB for clicking through
var colorArray = [];
// create based on how many are needed (will be same # as
var createColorArray = function(baseNum)
{
    var colorInterval = MAXHUE/(baseNum - 1);
    for(var i = 0; i <= MAXHUE + 1; i += colorInterval)
    {
        colorArray.push(color(i, MAXSAT, MAXSAT));
    }
};
createColorArray(base);

var legend = function(baseNum)
{
    var blockHeight = CANVASHEIGHT/base;
    for(var i = 0, index = 0; i <= CANVASHEIGHT; i+= blockHeight, index++)
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
        textSize(18 + 16/baseNum);
        text(digits[index],CANVASWIDTH - (LEGENDWIDTH/2), i + blockHeight/2);
    }
};
legend(base);

var Placeholder = function(config) 
{
    this.x = config.x || 12;
    this.y = config.y || 40;
    this.width = config.width || BLOCKWIDTH;
    this.height = config.height || 110;
    this.multiplier = config.multiplier || 0;
    this.value = config.value; 
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
    // need to decide what best UI is 
    // stroke(GRAY);
    // strokeWeight(5);
    noStroke();
    fill(colorArray[this.multiplier]);
    rect(this.x, this.y, this.width, this.height, 5);
    fill(BLACK);
    // add label within placeholder
    textSize(40);
    textAlign(CENTER, CENTER);
    text(digits[this.multiplier], this.x + this.width/2, this.y + this.height/2);
    // add up arrow if possible
    if(this.multiplier < base - 1)
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
Placeholder.prototype.draw = function() {
    fill(BLACK);
    // add label below to show what digit this is
    textSize(24);
    text(this.value, this.x + this.width/2, this.y + this.height + PADDING*3);
    this.update();
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
        if(this.multiplier === base)
        {
            this.multiplier = 0;
        }
    }
    else
    {
        // if top arrow is there
        if (this.multiplier < base - 1)
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
var initBlocks = function()
{
    // make blocks right oriented (so can start w/ 0)
    for (var i = CANVASWIDTH - LEGENDWIDTH - BLOCKWIDTH - PADDING, index = 0; 
         i > 0; i -= BLOCKWIDTH + PADDING, index++)
    {
        var test = new Placeholder({});
        test.x = i;
        test.value = pow(base, index);
        test.draw();
        PlaceholderArray.push(test);
    }
};
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
    while(number > 0)
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

// labels used to hold header and content
var ValueHolder = function(config) 
{
    this.x = config.x;
    this.y = config.y;
    this.width = config.width ||VALUEWIDTH;
    this.height = config.height||70;
    this.color = config.color;
};
// draw white inside box and print value
ValueHolder.prototype.update = function(value)
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
    value = value.toString();
    var width = value.length;
    // ensure that shorter numbers don't cause major overflow
    if (width < 4)
    {
        width = 4;
    }
    textSize(VALUEWIDTH/width);
    // centering text within box
    text(value,
             this.x + this.width/2, this.y+ this.height/2);
};

var value = new ValueHolder
({
    x: (CANVASWIDTH - LEGENDWIDTH - VALUEWIDTH)/2,
    y: 220,
    color: OUTLINEGRAY,
});
// button used for changebase
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
initBlocks();

var draw = function() {
      mouseClicked = function() {
         for(var i = 0, n = PlaceholderArray.length; i < n; i++)
         {
            PlaceholderArray[i].handleMouseClick();
         }
         value.update(blocksToNum());
      };
};
