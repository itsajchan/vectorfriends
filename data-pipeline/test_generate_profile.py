
import ollama

task1 = '''
Only respond with valid JSON, don't include anything outside of the JSON. Here's an example of JSON I want you to generate. 
{
    "techStack": "<INSERT AN INTERESTING TECHNOLOGY STACK, BE RANDOM!!!",
    "learnTech": "<COME UP WITH AN INTERESTING TECHNOLOGY AREA TO LEARN ABOUT, COULD BE WEB RELATED, AI, BITCOIN, Or ANYTHING! BE VERBOSE>",
    "openSource": "<INSERT A RANDOM OPENSOURCE PROJECT AND EXPLAIN WHAT IT IS>",
    "email": "<GENERATE A RANDOM EMAIL ADDRESS THAT MATCHES THE FIRST NAME>",
    "firstName": "<GENERATE A HIGHLY RANDOMIZED FIRST NAME>",
}

Generate an objects that look like the above but with randomized responses and input, but be a bit more verbose than the above example.
'''

response = ollama.chat(model='llama3:8b-instruct-q5_1', messages=[
  {
    'role': 'user',
    'content': f'''{task1}''',
  },
])

print(response['message']['content'])