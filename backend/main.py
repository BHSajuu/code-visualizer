import os
import json
import hashlib
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel

# --- Pydantic model for request body ---
# This defines the structure of the data we expect from the frontend
class CodeInput(BaseModel):
    code: str
    input_data: str

# Load environment variables (for API key)
load_dotenv()

# Configure the Gemini API
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-2.5-flash') # Or your preferred model like 'gemini-2.5-flash'
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    exit()

# Initialize our FastAPI app
app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROMPT_TEMPLATE = """
You are an expert code execution analyzer. Your task is to execute the given code step-by-step and generate a JSON array representing the state at each critical point.

**Code to Analyze:**
```java
{code}
```

**Initial Input:**
`{input_data}`

**JSON Output Schema:**
Each object in the JSON array must have these keys:
- `step`: An integer for the step number, starting from 0.
- `line_highlighted`: The line number in the code that is currently being executed.
- `explanation`: A concise, human-readable explanation of what is happening in this step (e.g., "Comparing elements at index i and j").
- `data_structure_state`: An object describing the visual state of the data structure.
    - `type`: The type of data structure (e.g., "array").
    - `values`: An array of the current values.
    - `highlights`: An object to specify which elements to color differently. For an array, use keys like `comparing` or `swapping` with an array of indices.

**Task:**
Generate the complete JSON storyboard for the execution of the provided code with the given input. The first step (step 0) should show the initial state before any execution. Respond ONLY with the raw JSON array, without any markdown formatting.
"""

api_cache = {}
@app.post("/api/visualize")
def get_visualization_storyboard(user_input: CodeInput):
    code_to_analyze = user_input.code
    input_data_str = user_input.input_data

 # Create a unique key for caching based on user input
    request_string = f"{code_to_analyze}{input_data_str}"
    request_key = hashlib.md5(request_string.encode()).hexdigest()

 # Check the cache first
    if request_key in api_cache:
        print("CACHE HIT: Returning saved result.")
        return {"storyboard": api_cache[request_key]}

    print("CACHE MISS: Calling Gemini API...")

    # Format the prompt with the user-provided code and input
    prompt = PROMPT_TEMPLATE.format(
        code=code_to_analyze.strip(),
        input_data=input_data_str.strip()
    )

    try:
        response = model.generate_content(prompt)
        cleaned_text = response.text.strip().replace("```json", "").replace("```", "")
    
        try:
            storyboard_json = json.loads(cleaned_text)
            api_cache[request_key] = storyboard_json # Save to cache
            return {"storyboard": storyboard_json}
        except json.JSONDecodeError:
            print("Error: Failed to decode JSON from Gemini response.")
            print("Raw response:", cleaned_text)
            raise HTTPException(status_code=500, detail="Failed to parse JSON response from AI.")

    except Exception as e:
        print(f"An error occurred while calling the Gemini API: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred with the AI service: {e}")