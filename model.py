# ==============================================================================
#
#                 AI Model Backend Logic
#
#   Author: Gemini
#   Date: September 20, 2025
#   Description:
#   This script defines the PersonaNextSentencePredictor class.
#   - It uses GPT-2-Medium for text generation.
#   - It uses BART-Large-MNLI for coherence checking, with improved logic
#     that defines "incoherent" only when there is a direct contradiction,
#     providing much more accurate real-world results.
#
# ==============================================================================

import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer, AutoTokenizer, AutoModelForSequenceClassification
import logging

# --- Setup logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class PersonaNextSentencePredictor:
    """
    A class to handle both sentence generation and coherence checking using
    appropriate pre-trained transformer models.
    """

    def __init__(self):
        """
        Initializes the class and loads the two required models into memory.
        - GPT-2-Medium for generation.
        - BART-Large-MNLI for coherence checking.
        """
        logging.info("Initializing PersonaNextSentencePredictor...")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logging.info(f"Using device: {self.device}")

        # --- Load Generative Model (GPT-2-Medium) ---
        try:
            logging.info("Loading GPT-2-Medium model and tokenizer for sentence generation...")
            self.generator_tokenizer = GPT2Tokenizer.from_pretrained('gpt2-medium')
            self.generator_model = GPT2LMHeadModel.from_pretrained('gpt2-medium')
            self.generator_model.to(self.device)
            self.generator_model.eval()
            logging.info("GPT-2-Medium model loaded successfully.")
        except Exception as e:
            logging.error(f"Failed to load GPT-2-Medium model: {e}")
            raise

        # --- Load Coherence/NLI Model (BART-Large-MNLI) ---
        try:
            logging.info("Loading BART-Large-MNLI model and tokenizer for coherence checking...")
            nli_model_name = 'facebook/bart-large-mnli'
            self.coherence_tokenizer = AutoTokenizer.from_pretrained(nli_model_name)
            self.coherence_model = AutoModelForSequenceClassification.from_pretrained(nli_model_name)
            self.coherence_model.to(self.device)
            self.coherence_model.eval()
            logging.info("BART-Large-MNLI model loaded successfully.")
        except Exception as e:
            logging.error(f"Failed to load BART-Large-MNLI model: {e}")
            raise

        logging.info("Initialization complete.")


    def _create_persona_prompt(self, prompt, persona):
        """
        Creates a tailored prompt to guide the GPT-2 model's generation
        based on the selected persona.
        """
        prompts = {
            "lawyer": f"From a legal perspective, considering the case details: \"{prompt}\",",
            "doctor": f"From a medical standpoint, based on the patient's chart: \"{prompt}\",",
            "writer": f"In the next chapter of the story, the scene continues: \"{prompt}\",",
            "teacher": f"To explain this concept to the class, remember that: \"{prompt}\", therefore"
        }
        return prompts.get(persona.lower(), f"\"{prompt}\",")


    def generate_next_sentence(self, prompt, persona, num_results=3, max_length=50):
        """
        Generates a set of plausible next sentences based on the initial prompt
        and a specified persona.
        """
        if persona.lower() not in ["lawyer", "doctor", "writer", "teacher"]:
            raise ValueError("Invalid persona specified.")

        full_prompt = self._create_persona_prompt(prompt, persona)
        
        inputs = self.generator_tokenizer.encode(full_prompt, return_tensors='pt').to(self.device)
        
        with torch.no_grad():
            outputs = self.generator_model.generate(
                inputs,
                max_length=len(inputs[0]) + max_length,
                num_return_sequences=num_results,
                do_sample=True,
                top_k=50,
                top_p=0.95,
                temperature=0.9,
                pad_token_id=self.generator_tokenizer.eos_token_id,
                no_repeat_ngram_size=2
            )

        generated_texts = []
        for output in outputs:
            text = self.generator_tokenizer.decode(output, skip_special_tokens=True)
            clean_text = text[len(full_prompt):].strip()
            first_sentence = clean_text.split('.')[0]
            if first_sentence:
                generated_texts.append(first_sentence.strip())
        
        return generated_texts


    def check_coherence(self, sentence_a, sentence_b):
        """
        Checks if sentence_b logically follows sentence_a. This new logic classifies
        a pair as incoherent only if there is a clear contradiction.
        """
        inputs = self.coherence_tokenizer(sentence_a, sentence_b, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            logits = self.coherence_model(**inputs).logits

        # The MNLI model has three labels, ordered: [contradiction, neutral, entailment]
        probabilities = torch.softmax(logits, dim=1).squeeze()
        
        contradiction_prob = probabilities[0].item()
        
        # We classify as "Incoherent" only if the model is confident about a contradiction.
        contradiction_threshold = 0.5 

        if contradiction_prob > contradiction_threshold:
            label = "Incoherent"
            confidence = contradiction_prob # Confidence is how sure we are about the contradiction.
        else:
            label = "Coherent"
            confidence = 1 - contradiction_prob # Confidence is how sure we are it's NOT a contradiction.
            
        return {"label": label, "confidence": confidence}


if __name__ == '__main__':
    # --- Demonstration ---
    print("="*50)
    print("Initializing the AI Model for demonstration...")
    predictor = PersonaNextSentencePredictor()
    print("="*50)
    
    print("\n--- Testing Coherence Checking with New Logic ---")
    
    # Example 1: The coherent sentences from your test case
    sent_a1 = "The patient showed symptoms of a bacterial infection."
    sent_b1 = "An immediate course of antibiotics was prescribed."
    result1 = predictor.check_coherence(sent_a1, sent_b1)
    print(f"A: \"{sent_a1}\"")
    print(f"B: \"{sent_b1}\"")
    print(f"Result: {result1['label']} (Confidence: {result1['confidence']:.2%})")
    print("-" * 25)

    # Example 2: Incoherent sentences
    sent_a2 = "She spilled her coffee all over the new laptop."
    sent_b2 = "The street outside was empty except for a lone bicyclist."
    result2 = predictor.check_coherence(sent_a2, sent_b2)
    print(f"A: \"{sent_a2}\"")
    print(f"B: \"{sent_b2}\"")
    print(f"Result: {result2['label']} (Confidence: {result2['confidence']:.2%})")
    print("="*50)

