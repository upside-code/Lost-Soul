fetch('data/shop.json')
    .then(res => res.json())
    .then(data =>
    {
        const shop = data.shop;
        const tbody =document.getElementById('shopBody');

        shop.items.forEach(item =>
        {
            const row = document.createElement('tr');
            row.innerHTML =
                `
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.price} ${shop.currency}</td>
                    <td>${item.stats.effects.type}</td>
                    <td>${item.stats.effects.value}</td>
                    <td>${item.stats.effects.chance ? item.stats.effects.chance + '%' : 'N/A'}</td>
                    <td>${item.stats.effects.stackable ? 'Yes' : 'No'}</td>
                `;
            tbody.appendChild(row);
        })
    })
    .catch(error =>
    {
        console.log('Error loading shop data: ', error);
    });

//`` are a template literal — they let you mix regular text with JavaScript variables using ${}:
//``````ALT+96``````$$$36$$$

/*
comments are not supported by jason file.... just wow....
{
  "id": "",
  "name": "",
  "type": "",
  "price": "",
  "stats":
  {

  }
}
 */