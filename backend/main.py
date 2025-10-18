import os
import json
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import hashlib


load_dotenv()

# Configure the Gemini API 
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    # Use the stable model name
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    # You might want to exit or handle this more gracefully
    exit()


app = FastAPI()

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

# This is the prompt template - it's the "magic sauce"
PROMPT_TEMPLATE = """
You are an expert code execution analyzer. Your task is to execute the given code step-by-step and generate a JSON array representing the state at each critical point.

**Code to Analyze:**
```python
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
@app.get("/api/visualize")
def get_visualization_storyboard():
    bubble_sort_code = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
    """
    
    input_array = [5, 1, 4, 2]

   # Create a unique key for this specific request
    # This ensures if the code or input changes, we get a new result
    request_string = f"{bubble_sort_code}{input_array}"
    request_key = hashlib.md5(request_string.encode()).hexdigest()

    # --- CHECK THE CACHE FIRST ---
    if request_key in api_cache:
        print("CACHE HIT: Returning saved result.")
        return {"storyboard": api_cache[request_key]}

    print("CACHE MISS: Calling Gemini API...")
    # (The rest of your code that formats the prompt and calls the API)
    prompt = PROMPT_TEMPLATE.format(
        code=bubble_sort_code.strip(),
        input_data=f"arr = {input_array}"
    )

    try:
        response = model.generate_content(prompt)
        cleaned_text = response.text.strip().replace("```json", "").replace("```", "")

        try:
            storyboard_json = json.loads(cleaned_text)

            # --- SAVE THE NEW RESULT TO THE CACHE ---
            api_cache[request_key] = storyboard_json

            return {"storyboard": storyboard_json}
        except json.JSONDecodeError:
            print("Error: Failed to decode JSON from Gemini response.")
            print("Raw response:", cleaned_text)
            raise HTTPException(status_code=500, detail="Failed to parse JSON response from AI.")

    except Exception as e:
        print(f"An error occurred while calling the Gemini API: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred with the AI service: {e}")
