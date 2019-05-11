import json

with open('datasets/data-1.json') as json_file:
    data = json.load(json_file)

result = []
for d in data:
    acum = 0
    color = d['Domain color']
    for c in color:
        c.append(acum)
        acum += c[1]

print(data)
with open('datasets/data-1-1.json','w') as fp:
    json.dump(result,fp)
