import requests
import time
import json
import os
from typing import Dict, Any, List
from dotenv import load_dotenv
from groq import Groq

# --- Groq Client for Prompt Refinement ---


class GroqClient:
    """A client to refine user prompts using the Groq API."""

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Groq API key is required.")
        self.client = Groq(api_key=api_key)

    def generate_prompts(self, user_prompt: str) -> Dict[str, str]:
        """
        Uses Groq to split a user prompt into an object prompt (for shape)
        and a style prompt (for texture).
        """
        print(f"Refining prompt with Groq: '{user_prompt}'")
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a prompt engineer for a text-to-3D AI. Your task is to interpret a user's request "
                            "and break it down into two components: an 'object_prompt' for generating the 3D model's shape, "
                            "and a 'style_prompt' for texturing the model. The 'object_prompt' should be a concise, "
                            "one-sentence description of the object's geometry. The 'style_prompt' should describe the "
                            "materials, colors, patterns, and overall aesthetic. Respond ONLY with a valid JSON object "
                            "with the keys 'object_prompt' and 'style_prompt'."
                        ),
                    },
                    {"role": "user", "content": user_prompt},
                ],
                model="llama-3.3-70b-versatile",
                max_tokens=40,
            )
            response_text = chat_completion.choices[0].message.content
            prompts = json.loads(response_text)
            print(f"Groq refined prompts: {prompts}")
            return prompts
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            # Fallback for simple prompts if Groq fails
            return {"object_prompt": user_prompt, "style_prompt": user_prompt}


# --- Meshy API Client ---


class MeshyAPI:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Meshy API key is required.")
        self.api_key = api_key
        self.base_url = "https://api.meshy.ai"
        self.headers = {"Authorization": f"Bearer {api_key}"}

    def create_preview_task(self, prompt: str) -> str:
        """Create a preview task (v2) and return task ID."""
        payload = {"mode": "preview", "prompt": prompt, "art_style": "realistic"}
        response = requests.post(
            f"{self.base_url}/openapi/v2/text-to-3d", headers=self.headers, json=payload
        )
        response.raise_for_status()
        return response.json()["result"]

    def create_texture_task(
        self, model_url: str, object_prompt: str, style_prompt: str
    ) -> str:
        """Create an AI texturing task (v1) and return task ID."""
        payload = {
            "model_url": model_url,
            "object_prompt": object_prompt,
            "style_prompt": style_prompt,
            "enable_pbr": True,
        }
        response = requests.post(
            f"{self.base_url}/v1/ai-texturing", headers=self.headers, json=payload
        )
        response.raise_for_status()
        return response.json()["result"]

    def get_task_status(self, task_id: str, task_type: str) -> Dict[str, Any]:
        """Get task status, supporting different API versions."""
        if task_type == "preview":
            url = f"{self.base_url}/openapi/v2/text-to-3d/{task_id}"
        elif task_type == "texture":
            url = f"{self.base_url}/v1/tasks/{task_id}"
        else:
            raise ValueError(f"Unknown task type: {task_type}")

        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def wait_for_task_completion(
        self, task_id: str, task_type: str, timeout: int = 900
    ) -> Dict[str, Any]:
        """Wait for a task to complete by polling its status."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            task_data = self.get_task_status(task_id, task_type)
            status = task_data["status"]
            progress = task_data.get("progress", 0)
            print(
                f"Task {task_id} ({task_type}) status: {status} (Progress: {progress}%)"
            )

            if status == "SUCCEEDED":
                return task_data
            elif status in ["FAILED", "CANCELED"]:
                raise Exception(
                    f"Task {task_id} failed with status: {status}. Error: {task_data.get('error')}"
                )

            time.sleep(10)
        raise TimeoutError(f"Task {task_id} timed out after {timeout} seconds.")

    def download_asset(self, url: str, folder: str, filename: str) -> str:
        """Downloads an asset from a URL to a local file."""
        os.makedirs(folder, exist_ok=True)
        local_path = os.path.join(folder, filename)
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        print(f"Downloaded asset to {local_path}")
        return local_path


# --- Main Orchestration Logic ---


def generate_and_save_model(
    user_prompt: str, meshy: MeshyAPI, groq: GroqClient
) -> Dict[str, Any]:
    """Full pipeline to generate a 3D model, texture it, and save assets."""
    print(f"\n--- Starting 3D model generation for: '{user_prompt}' ---")

    # 1. Refine prompt with Groq
    prompts = groq.generate_prompts(user_prompt)
    object_prompt = prompts["object_prompt"]
    style_prompt = prompts["style_prompt"]

    # 2. Create and wait for preview model
    print("\n--- Step 1: Creating Preview Model ---")
    preview_task_id = meshy.create_preview_task(object_prompt)
    preview_result = meshy.wait_for_task_completion(preview_task_id, "preview")
    preview_model_url = preview_result.get("model_urls", {}).get("glb")
    if not preview_model_url:
        raise Exception("Preview task succeeded but did not return a .glb model URL.")

    # 3. Create and wait for texturing task
    print("\n--- Step 2: Texturing Model ---")
    texture_task_id = meshy.create_texture_task(
        preview_model_url, object_prompt, style_prompt
    )
    final_result = meshy.wait_for_task_completion(texture_task_id, "texture")

    # 4. Download all assets
    print("\n--- Step 3: Downloading Final Assets ---")
    output_folder = os.path.join("models", final_result["id"])
    saved_files = {}

    # Download model file
    model_url = final_result.get("model_url")
    if model_url:
        file_ext = os.path.splitext(model_url.split("?")[0])[-1] or ".glb"
        saved_files["model"] = meshy.download_asset(
            model_url, output_folder, f"model{file_ext}"
        )

    # Download thumbnail
    thumb_url = final_result.get("thumbnail_url")
    if thumb_url:
        saved_files["thumbnail"] = meshy.download_asset(
            thumb_url, output_folder, "thumbnail.png"
        )

    # Download textures
    texture_urls: List[Dict[str, str]] = final_result.get("texture_urls", [])
    saved_files["textures"] = []
    for texture in texture_urls:
        url = texture.get("url")
        base_name = texture.get("base_name")
        if url and base_name:
            saved_files["textures"].append(
                meshy.download_asset(url, output_folder, base_name)
            )

    print("\n--- Generation and Download Complete! ---")
    return saved_files


def main():
    """
    Main function to run the 3D model generation pipeline.
    """
    # For this to work, you must create a file named `.env.local` in the same
    # directory as this script, with the following content:
    # MESHY_API_KEY="your_meshy_api_key"
    # GROQ_API_KEY="your_groq_api_key"
    load_dotenv(".env.local")
    meshy_api_key = os.getenv("MESHY_API_KEY")
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not meshy_api_key or not groq_api_key:
        raise ValueError("Please set MESHY_API_KEY and GROQ_API_KEY in .env.local")

    try:
        # Initialize API clients
        meshy = MeshyAPI(meshy_api_key)
        groq = GroqClient(groq_api_key)

        # Define the model to generate
        prompt = "a highly detailed mechanical crane with weathered yellow paint and rust spots"

        # Generate and save the 3D model
        saved_model_paths = generate_and_save_model(prompt, meshy, groq)

        print("\n--- Final Saved File Paths ---")
        print(json.dumps(saved_model_paths, indent=2))

    except (ValueError, Exception) as e:
        print(f"\nAn error occurred: {e}")


if __name__ == "__main__":
    main()
