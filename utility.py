import json

with open('datasets/data_s.json') as json_file:
    data = json.load(json_file)

print(data[0])
result = []
for d in data:
    acum = 0
    color = d['Domain color']
    for c in color:
        c.append(acum)
        acum += c[1]

# print(data)
with open('datasets/data_final.json','w') as fp:
    json.dump(data,fp)
