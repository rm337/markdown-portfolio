#target illustrator

function createBusinessCard() {
    // Constants
    const CARD_WIDTH = 88.9; // mm (3.5 inches)
    const CARD_HEIGHT = 50.8; // mm (2 inches)
    const MARGIN = 5; // mm
    const FONT_SIZE = 10; // pt
    const TEXT_COLOR = [0, 0, 0]; // Black
    const BACKGROUND_COLOR = [255, 255, 255]; // White
    
    // Create a new document
    var doc = app.documents.add(DocumentColorSpace.CMYK);
    doc.artboards[0].artboardRect = [
        0,
        CARD_HEIGHT,
        CARD_WIDTH,
        0
    ];

    // Create the background rectangle
    var background = doc.pathItems.rectangle(
        CARD_HEIGHT, 0, CARD_WIDTH, CARD_HEIGHT
    );
    background.filled = true;
    background.fillColor = createRGBColor(BACKGROUND_COLOR);
    background.stroked = false;

    // Add a logo placeholder
    var logo = doc.pathItems.rectangle(
        CARD_HEIGHT - MARGIN, MARGIN, 20, 20
    );
    logo.filled = true;
    logo.fillColor = createRGBColor([200, 200, 200]); // Light gray
    logo.stroked = true;
    logo.strokeWidth = 1;
    logo.strokeColor = createRGBColor([0, 0, 0]);

    // Add a text frame for the name
    var nameTextFrame = doc.textFrames.add();
    nameTextFrame.contents = "Your Name";
    nameTextFrame.textRange.characterAttributes.size = FONT_SIZE;
    nameTextFrame.textRange.fillColor = createRGBColor(TEXT_COLOR);
    nameTextFrame.position = [MARGIN, CARD_HEIGHT - MARGIN - 20];

    // Add a text frame for the job title
    var jobTitleTextFrame = doc.textFrames.add();
    jobTitleTextFrame.contents = "Your Job Title";
    jobTitleTextFrame.textRange.characterAttributes.size = FONT_SIZE - 2;
    jobTitleTextFrame.textRange.fillColor = createRGBColor(TEXT_COLOR);
    jobTitleTextFrame.position = [MARGIN, CARD_HEIGHT - MARGIN - 35];

    // Add a text frame for contact details
    var contactTextFrame = doc.textFrames.add();
    contactTextFrame.contents = "Phone: 123-456-7890\nEmail: your.email@example.com\nWebsite: www.example.com";
    contactTextFrame.textRange.characterAttributes.size = FONT_SIZE - 2;
    contactTextFrame.textRange.fillColor = createRGBColor(TEXT_COLOR);
    contactTextFrame.position = [MARGIN, CARD_HEIGHT - MARGIN - 60];

    // Helper function to create an RGB color
    function createRGBColor(rgbArray) {
        var color = new RGBColor();
        color.red = rgbArray[0];
        color.green = rgbArray[1];
        color.blue = rgbArray[2];
        return color;
    }
}

createBusinessCard();
