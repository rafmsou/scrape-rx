## ScrapeRx
List the best prices for prescription drugs from a list of 3rd party platforms such
as GoodRx and WellRx by scraping their Web Apps using puppeteer and a set of plugins (puppeteer-extra)
to avoid being blocked by CAPTCHA systems.

This consists of a set of lambda functions written in Typescript and compiled
to ES5, one for each service provider.

### Endpoints
http://localhost:8080/goodrx      -> Scrape from https://www.goodrx.com</br>
http://localhost:8080/wellrx      -> Scrape from https://www.wellrx.com</br>
http://localhost:8080/lowermyrx   -> Scrape from https://savingstool.lowermyrx.com</br>
http://localhost:8080/optumperks  -> Scrape from https://perks.optum.com</br>
http://localhost:8080/rxsaver     -> Scrape from https://rxsaver.retailmenot.com

Each endpoint requires a `drug` and `zipcode` parameter that it'll use to input
on each target platform.

### How to Run
`yarn start` to spin up a local server for cloud functions.</br>
`yarn watch` to spin up a local development server with code reload support.

### Examples:

GET http://localhost:8080/wellrx?drug=metformin&zipcode=91325
```
{
    "source": "wellrx",
    "offers": [
        {
            "pharmacyName": "SAVON PHARMACY  ",
            "price": "$6.26"
        },
        {
            "pharmacyName": "ABSOLUTE WELLNESS PHARMACY  ",
            "price": "$6.55"
        },
        {
            "pharmacyName": "NORTHRIDGE CENTER PHARMACY  ",
            "price": "$7.02"
        }
    ],
    "location": "91325"
}
```

GET http://localhost:8080/optumperks?drug=lipitor&zipcode=91325
```
{
    "source": "optumperks",
    "offers": [
        {
            "pharmacyName": "Costco Pharmacy",
            "price": "6.99"
        },
        {
            "pharmacyName": "Walmart Pharmacy",
            "price": "15.00"
        },
        {
            "pharmacyName": "Rite Aid Pharmacy",
            "price": "19.82"
        }
    ],
    "location": "All Prices within 5 miles of 91325"
}
```
