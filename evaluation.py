import os
import io
import time
from PIL import Image
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions.mouse_button import MouseButton
from dotenv import load_dotenv

import google.generativeai as genai

# --- Configuration ---
# IMPORTANT: Before running, set your Google API key as an environment variable.
# For Windows: set GOOGLE_API_KEY=your_api_key
# For macOS/Linux: export GOOGLE_API_KEY=your_api_key
#
# You also need to install the required libraries:
# pip install selenium google-generativeai pillow
#
# Finally, ensure you have a WebDriver for your browser (e.g., chromedriver)
# installed and available in your system's PATH.

# Data from the provided JSON
SKETCHFAB_DATA = {
    "keywords": "crane, hook, construction, industrial, machinery \n",
    "search_results": [
        {
            "name": "Crane",
            "uid": "f72100478eee4a0fbe39b2f116bce512",
            "viewerUrl": "https://sketchfab.com/3d-models/none-f72100478eee4a0fbe39b2f116bce512",
            "embedURL": "https://sketchfab.com/models/f72100478eee4a0fbe39b2f116bce512/embed",
        },
        {
            "name": "Creative Crane (animated)",
            "uid": "01aba18934cb49ffa52dda2e47d08c34",
            "viewerUrl": "https://sketchfab.com/3d-models/none-01aba18934cb49ffa52dda2e47d08c34",
            "embedURL": "https://sketchfab.com/models/01aba18934cb49ffa52dda2e47d08c34/embed",
        },
        {
            "name": "Crane STOTHERT&PITT",
            "uid": "addc9b2b990d4d3e96ba4d1ef70b597c",
            "viewerUrl": "https://sketchfab.com/3d-models/none-addc9b2b990d4d3e96ba4d1ef70b597c",
            "embedURL": "https://sketchfab.com/models/addc9b2b990d4d3e96ba4d1ef70b597c/embed",
        },
        {
            "name": "Crane Mast",
            "uid": "3b943b2211284d0cb0bbad32399be58c",
            "viewerUrl": "https://sketchfab.com/3d-models/none-3b943b2211284d0cb0bbad32399be58c",
            "embedURL": "https://sketchfab.com/models/3b943b2211284d0cb0bbad32399be58c/embed",
        },
        {
            "name": "Claw Machine / Toy Crane",
            "uid": "4010f321be544c589dc040fbe8afd2bc",
            "viewerUrl": "https://sketchfab.com/3d-models/none-4010f321be544c589dc040fbe8afd2bc",
            "embedURL": "https://sketchfab.com/models/4010f321be544c589dc040fbe8afd2bc/embed",
        },
    ],
}

# Extract the embed URLs to visit and analyze
URLS_TO_ANALYZE = [
    result["embedURL"]
    for result in SKETCHFAB_DATA["search_results"]
    if isinstance(result, dict) and "embedURL" in result
]


def analyze_webpages(urls):
    """
    Analyzes a list of URLs by taking a screenshot and using Gemini to classify the content.

    Args:
            urls (list): A list of URL strings to analyze.
    """
    # --- 1. Configure Google Gemini API ---
    try:
        load_dotenv(dotenv_path=".env.local")
        api_key = os.environ.get("GOOGLE_GENERATIVE_AI_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not found.")
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
    except Exception as e:
        print(f"Error configuring Gemini API: {e}")
        return

    # --- 2. Initialize Selenium WebDriver ---
    driver = None
    try:
        print("Initializing browser...")
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")  # Run browser in the background
        options.add_argument("--window-size=1280,1024")  # Set a consistent window size
        driver = webdriver.Chrome(options=options)
        print("Browser initialized.")

        # --- 3. Process each URL ---
        for url in urls:
            print(f"\n{'=' * 20}\nProcessing URL: {url}\n{'=' * 20}")
            try:
                # Navigate to the page
                driver.get(url)
                # Wait a moment for the page to render completely
                time.sleep(10)  # Increased wait time for 3D models to load

                # Find the main body of the page
                body = driver.find_element(By.TAG_NAME, "body")

                # Simulate a left-mouse-button click on the body
                # Note: This action may not have a visible effect on many websites.
                print("Performing left-click...")
                ActionChains(driver).move_to_element(body).click().perform()
                time.sleep(1)  # Wait a moment after the click

                # Take a screenshot
                print("Taking screenshot...")
                screenshot_bytes = driver.get_screenshot_as_png()
                img = Image.open(io.BytesIO(screenshot_bytes))

                # Prepare the prompt for Gemini
                prompt = (
                    "Look at the following screenshot of a webpage. "
                    "Does this page display a 3D model of a Mechanical engineering crane or related "
                    "industrial machinery? Please answer with a simple 'Yes' or 'No' "
                    "and provide a brief one-sentence explanation."
                )

                # Ask Gemini to analyze the image
                print("Sending screenshot to Gemini for analysis...")
                response = model.generate_content([prompt, img])

                print("\n--- Gemini's Analysis ---")
                print(f"URL: {url}")
                print(f"Analysis: {response.text.strip()}")
                print("---------------------------\n")

            except Exception as e:
                print(f"Could not process {url}. Error: {e}")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        # --- 4. Clean up ---
        if driver:
            print("Closing browser.")
            driver.quit()


if __name__ == "__main__":
    analyze_webpages(URLS_TO_ANALYZE)
