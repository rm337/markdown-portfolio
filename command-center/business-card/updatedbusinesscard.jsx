#target illustrator

function createBusinessCard() {
    // Conversion function: mm to pt
    function mmToPoints(mm) {
        return mm * 2.83465; // 1 mm = 2.83465 points
    }

    // Dimensions in millimeters (easily adjustable)
    const CARD_WIDTH_MM = 88.9; // mm
    const CARD_HEIGHT_MM = 50.8; // mm
    const MARGIN_MM = 5; // mm
    const LOGO_SIZE_MM = 20; // mm

    // Dimensions in points (converted automatically)
    const CARD_WIDTH = mmToPoints(CARD_WIDTH_MM);
    const CARD_HEIGHT = mmToPoints(CARD_HEIGHT_MM);
    const MARGIN = mmToPoints(MARGIN_MM);
    const LOGO_SIZE = mmToPoints(LOGO_SIZE_MM);

    // Additional constants
    const FONT_SIZE = 10; // pt
    const TEXT_COLOR = [0, 0, 0]; // Black
    const BACKGROUND_COLOR = [255, 255, 255]; // White

    // Create a new document
    var doc = app.documents.add(DocumentColorSpace.CMYK);
    doc.artboards[0].artboardRect = [0, CARD_HEIGHT, CARD_WIDTH, 0];

    // Create the background rectangle
    var background = doc.pathItems.rectangle(
        CARD_HEIGHT, 0, CARD_WIDTH, CARD_HEIGHT
    );
    background.filled = true;
    background.fillColor = createRGBColor(BACKGROUND_COLOR);
    background.stroked = false;

    // Add a logo placeholder
    var logo = doc.pathItems.rectangle(
        CARD_HEIGHT - MARGIN, MARGIN, LOGO_SIZE, LOGO_SIZE
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
    nameTextFrame.position = [MARGIN, CARD_HEIGHT - MARGIN - LOGO_SIZE];

    // Add a text frame for the job title
    var jobTitleTextFrame = doc.textFrames.add();
    jobTitleTextFrame.contents = "Your Job Title";
    jobTitleTextFrame.textRange.characterAttributes.size = FONT_SIZE - 2;
    jobTitleTextFrame.textRange.fillColor = createRGBColor(TEXT_COLOR);
    jobTitleTextFrame.position = [MARGIN, CARD_HEIGHT - MARGIN - LOGO_SIZE - mmToPoints(5)];

    // Add a text frame for contact details
    var contactTextFrame = doc.textFrames.add();
    contactTextFrame.contents = "Phone: 123-456-7890\nEmail: your.email@example.com\nWebsite: www.example.com";
    contactTextFrame.textRange.characterAttributes.size = FONT_SIZE - 2;
    contactTextFrame.textRange.fillColor = createRGBColor(TEXT_COLOR);
    contactTextFrame.position = [MARGIN, CARD_HEIGHT - MARGIN - LOGO_SIZE - mmToPoints(20)];

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
