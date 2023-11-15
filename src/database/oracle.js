const config = require('./conf')
const oracledb = require('oracledb')
const { query } = require('express')





async function mehrereKundenHochladen(userID) {
  let conn

  try {

    zipFiles.forEach(zipFile => {
      handleReadFile(zipFile,res,req,true,zipFiles.length)
    });

    
    conn.commit()
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}



async function initiateOrder(userID) {
  let conn

  try {
    conn = await oracledb.getConnection(config)


    const hatBestellung = await conn.execute("select KUNDENNUMMER from BESTELLUNG where Kundennummer = :userID",[userID])

    try {
      if (hatBestellung.rows.length === 0) {
        await conn.execute('INSERT INTO BESTELLUNG(KUNDENNUMMER, ZEITSTEMPEL) VALUES (:userID,sysdate)', [userID]);
        conn.commit
      }
    } catch (error) {
      console.error('Fehler beim Einfügen: Bestellung ' + error.message);
    }    



    const productsForBestellung = await conn.execute('SELECT PRODUKT.PREIS, PRODUKT.ARTIKELNR FROM PRODUKT,WARENKORB,WARENKORB_ENTHÄLT_PRODUKT where WARENKORB.KUNDENNUMMER = WARENKORB_ENTHÄLT_PRODUKT.KUNDENNUMMER AND WARENKORB_ENTHÄLT_PRODUKT.ARTIKELNR = PRODUKT.ARTIKELNR and WARENKORB.KUNDENNUMMER = :userID',[userID])
    let position = 1

    for (let productg in productsForBestellung.rows){
      await conn.execute('INSERT INTO BESTELLUNG_ENTHÄLT_PRODUKT (ARTIKELNR, KUNDENNUMMER) VALUES (:artnr,:userID)',[productsForBestellung.rows[productg][1],userID])
      position = position + 1
    }

    await conn.execute('DELETE FROM WARENKORB_ENTHÄLT_PRODUKT WHERE KUNDENNUMMER = :userID', [userID])
    await conn.execute('UPDATE WARENKORB SET GESAMTSUMME = 0 WHERE KUNDENNUMMER = :userID',[userID])
    
    conn.commit()
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function fleacheAufBearbeitetSetzen(productIDs) {
  let conn

  try {

    conn = await oracledb.getConnection(config)




    for (const id of productIDs) {

      await conn.execute("delete PRODUKT_ENTHÄLT_PROBE where ARTIKELNR = :productID",[id.productId])

      await conn.execute("UPDATE PRODUKT set STARTDATUM = TO_DATE(:dateValue,'yyyy-mm-dd') where ARTIKELNR = :id",[id.dateValue, id.productId]);

    

      if(id.NminValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,3)",[id.productId])
      } 
      
      if(id.SminValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,2,3)",[id.productId])
      }

      if(id.HumusValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,3,3)",[id.productId])
      }

      if(id.CnValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,4,3)",[id.productId])
      }

    }

 
    conn.commit()
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}




async function getaufBearbeitenStellen(productIDs) {

  let conn

  try {
    conn = await oracledb.getConnection(config)
    for (const id of productIDs) {

      await conn.execute("delete PRODUKT_ENTHÄLT_PROBE where ARTIKELNR = :productID",[id.productId])


    

      if(id.NminValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[id.productId])
      } 
      
      if(id.SminValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,2,1)",[id.productId])
      }

      if(id.HumusValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,3,1)",[id.productId])
      }

      if(id.CnValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,4,1)",[id.productId])
      }

    }

 
    conn.commit()
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function initiateOrderNew(userID,productID,NminValue,MangatValue,StickstoffValue) {
  let conn

  try {
    conn = await oracledb.getConnection(config)

    //TODO eigentlich muss deletet und dann neu gemacht werden 

    await conn.execute("delete PRODUKT_ENTHÄLT_PROBE where ARTIKELNR = :productID",[productID])





    if(MangatValue=='j'){
      await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[productID])
    } 
    
    if(NminValue=='j'){
      await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,2,1)",[productID])
    }

    if(StickstoffValue=='j'){
      await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,3,1)",[productID])
    }

 
    conn.commit()
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function deleteFromCart(userID,productID){
  let conn

  try {
    conn = await oracledb.getConnection(config)

    console.error('gggg'+productID)


    const result = await conn.execute(
      'DELETE FROM WARENKORB_ENTHÄLT_PRODUKT where KUNDENNUMMER = :userID AND ARTIKELNR = :productID ',[userID,productID]
    )
    // Gesamtpreis muss Upgedatet werden
    await conn.execute('UPDATE WARENKORB SET GESAMTSUMME = GESAMTSUMME - (select PREIS from PRODUKT WHERE ARTIKELNR = :productID) ',[productID])
    await conn.execute('UPDATE WARENKORB SET ANZAHLPOSITIONEN = ANZAHLPOSITIONEN - 1 WHERE KUNDENNUMMER = :userID',[userID])  
    conn.commit()
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()  
    }
  }
}

async function getfleachenFromAllUser(userID) {
  let conn
  let fleachen

  try {
    conn = await oracledb.getConnection(config)   

    //Alle Produkte des Warenkorbs des Users auslesen
    fleachen = await conn.execute(`SELECT DISTINCT fc.ARTIKELNR, fc.FKOORDINATENIDLAT, fc.FKOORDINATENIDLNG, fc.POSITIONSPUNKT,
    CASE WHEN PP.PROBENARTID IS NOT NULL THEN 1 ELSE 0 END AS enthält_nmin,
    CASE WHEN PSmin.PROBENARTID IS NOT NULL THEN 1 ELSE 0 END AS enthält_smin,
    CASE WHEN PHumus.PROBENARTID IS NOT NULL THEN 1 ELSE 0 END AS enthält_humus,
    CASE WHEN PCN.PROBENARTID IS NOT NULL THEN 1 ELSE 0 END AS enthält_cn,
    P.FLÄCHENNAME, P.STARTDATUM, P.FLEACHENART, P.KUNDENNUMMER, 
    PEP.PROBENSTATUS
    FROM FLEACHENKOORDINATE fc
    JOIN PRODUKT P ON p.ARTIKELNR = fc.ARTIKELNR
    JOIN PRODUKT_ENTHÄLT_PROBE PEP ON p.ARTIKELNR = PEP.ARTIKELNR
    JOIN BESTELLUNG_ENTHÄLT_PRODUKT wp ON wp.ARTIKELNR = p.ARTIKELNR
    JOIN BESTELLUNG w ON w.KUNDENNUMMER = wp.KUNDENNUMMER
        LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PP ON P.ARTIKELNR = PP.ARTIKELNR AND PP.PROBENARTID = 1
LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PSmin ON P.ARTIKELNR = PSmin.ARTIKELNR AND PSmin.PROBENARTID = 2
LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PHumus ON P.ARTIKELNR = PHumus.ARTIKELNR AND PHumus.PROBENARTID = 3
  LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PCN ON P.ARTIKELNR = PCN.ARTIKELNR AND PCN.PROBENARTID = 4
    order by ARTIKELNR, POSITIONSPUNKT

`);
    return fleachen
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getFleachenFromUserBestellt(userID) {
  let conn
  let fleachen

  try {
    conn = await oracledb.getConnection(config)
    
    fleachen = await conn.execute(`
      SELECT DISTINCT fc.ARTIKELNR, fc.FKOORDINATENIDLAT, fc.FKOORDINATENIDLNG, fc.POSITIONSPUNKT, PEP.PROBENSTATUS
      FROM FLEACHENKOORDINATE fc
      JOIN PRODUKT p ON p.ARTIKELNR = fc.ARTIKELNR
      JOIN PRODUKT_ENTHÄLT_PROBE PEP ON p.ARTIKELNR = PEP.ARTIKELNR
      JOIN BESTELLUNG_ENTHÄLT_PRODUKT wp ON wp.ARTIKELNR = p.ARTIKELNR
      JOIN BESTELLUNG w ON w.KUNDENNUMMER = wp.KUNDENNUMMER
      JOIN KUNDE k ON k.KUNDENNUMMER = w.KUNDENNUMMER
      WHERE K.KUNDENNUMMER = :userID
      order by fc.ARTIKELNR, fc.POSITIONSPUNKT
    `,[userID]);

    return fleachen
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function getCartFromUser(userID) {
  let conn
  let cart = {
    gesamtsummeInklMwst: null,
    gesamtsumme: null,
    mwst: null,
    products: []
  }

  try {
    conn = await oracledb.getConnection(config)
    
    //Gesamtsumme inkl. MwSt ermitteln
    let result = await conn.execute(
      'select GESAMTSUMME from WARENKORB where KUNDENNUMMER = :userID',[userID]
    )

    if(result.rows[0] != null){
      cart.gesamtsummeInklMwst = result.rows[0][0]
    }
    
    //Alle Produkte des Warenkorbs des Users auslesen
    let result2 = await conn.execute('SELECT * from Produkt where ARTIKELNR IN (SELECT ARTIKELNR from WARENKORB_ENTHÄLT_PRODUKT where KUNDENNUMMER = :userID)',[userID])
    cart.products = result2.rows


    //Alle Produkte des Warenkorbs des Users auslesen
    let result43 = await conn.execute(`
    SELECT
    P.*,
    CASE WHEN PP.PROBENARTID IS NOT NULL THEN 1 ELSE 0 END AS enthält_nmin,
    CASE WHEN PSmin.PROBENARTID IS NOT NULL THEN 1 ELSE 0 END AS enthält_smin,
    CASE WHEN PHumus.PROBENARTID IS NOT NULL THEN 1 ELSE 0 END AS enthält_humus,
    CASE WHEN PCN.PROBENARTID IS NOT NULL THEN 1 ELSE 0 END AS enthält_cn
FROM
    Kunde K
JOIN
    Warenkorb W ON K.KUNDENNUMMER = W.KUNDENNUMMER
JOIN
    Warenkorb_enthält_produkt WP ON W.KUNDENNUMMER = WP.KUNDENNUMMER
JOIN
    Produkt P ON WP.ARTIKELNR = P.ARTIKELNR
LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PP ON P.ARTIKELNR = PP.ARTIKELNR AND PP.PROBENARTID = 1
LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PSmin ON P.ARTIKELNR = PSmin.ARTIKELNR AND PSmin.PROBENARTID = 2
LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PHumus ON P.ARTIKELNR = PHumus.ARTIKELNR AND PHumus.PROBENARTID = 3
  LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PCN ON P.ARTIKELNR = PCN.ARTIKELNR AND PCN.PROBENARTID = 4
WHERE
    K.KUNDENNUMMER = :userID
`,[userID]);


      cart.products = result43.rows

    //Gesamtsumme ohne MwSt Anteil berechnen
      const result3 = await conn.execute('select sum(PRODUKT.PREIS) from PRODUKT,WARENKORB_ENTHÄLT_PRODUKT where PRODUKT.ARTIKELNR = WARENKORB_ENTHÄLT_PRODUKT.ARTIKELNR AND WARENKORB_ENTHÄLT_PRODUKT.KUNDENNUMMER = :userID ',[userID])
      cart.gesamtsumme = result3.rows[0][0]
    
    //MwSt berechnen
      cart.mwst = cart.gesamtsummeInklMwst - cart.gesamtsumme

    return cart
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function getInformationsForGenerateKmlFile(productIDs) {
  const conn = await oracledb.getConnection(config);



  // Initialisieren Sie das Array
  const infoProductIDs = [];

  // Fügen Sie für jede ID ein Objekt hinzu

  if (Array.isArray(productIDs)) {
    for (const id of productIDs) {
      const infoProdukt = await conn.execute('select ARTIKELNR, KUNDENNUMMER, STARTDATUM, FLEACHENART , FLÄCHENNAME  from PRODUKT where ARTIKELNR = :id', [id])
      const infoFlaechenkoordinate = await conn.execute('select FKOORDINATENIDLNG,FKOORDINATENIDLAT from FLEACHENKOORDINATE where ARTIKELNR = :id order by POSITIONSPUNKT', [id])
      const infoFlaechenkoordinateErste = await conn.execute('select FKOORDINATENIDLNG,FKOORDINATENIDLAT from FLEACHENKOORDINATE where ARTIKELNR = :id and POSITIONSPUNKT = 1', [id])
      


      const flaecheninfo = infoFlaechenkoordinate.rows;
      const flaecheninfoErste = infoFlaechenkoordinateErste.rows

      // Umwandlung des Arrays in ein Array von Koordinatenpaaren
      var coordinates = '';
      for (let i = 0; i < flaecheninfo.length; i ++) {
        coordinates = coordinates + '' + flaecheninfo[i][0] + ',' + flaecheninfo[i][1] + ' ';
      }

      coordinates = coordinates + '' + flaecheninfoErste[0][0] + ',' + flaecheninfoErste[0][1]

      
      infoProductIDs.push({
        id: id,
        produktinfo: [infoProdukt.rows[0]],
        flaecheninfo: [coordinates]
      });
    }
  } else {
    const infoProdukt = await conn.execute('select ARTIKELNR, KUNDENNUMMER, STARTDATUM, FLEACHENART , FLÄCHENNAME  from PRODUKT where ARTIKELNR = :id', [productIDs])
    const infoFlaechenkoordinate = await conn.execute('select FKOORDINATENIDLNG,FKOORDINATENIDLAT from FLEACHENKOORDINATE where ARTIKELNR = :id order by POSITIONSPUNKT', [productIDs])
    const infoFlaechenkoordinateErste = await conn.execute('select FKOORDINATENIDLNG,FKOORDINATENIDLAT from FLEACHENKOORDINATE where ARTIKELNR = :id and POSITIONSPUNKT = 1', [productIDs])
    


    const flaecheninfo = infoFlaechenkoordinate.rows;
    const flaecheninfoErste = infoFlaechenkoordinateErste.rows

    // Umwandlung des Arrays in ein Array von Koordinatenpaaren
    var coordinates = '';
    for (let i = 0; i < flaecheninfo.length; i ++) {
      coordinates = coordinates + '' + flaecheninfo[i][0] + ',' + flaecheninfo[i][1] + ' ';
    }

    coordinates = coordinates + '' + flaecheninfoErste[0][0] + ',' + flaecheninfoErste[0][1]

    
    infoProductIDs.push({
      id: productIDs,
      produktinfo: [infoProdukt.rows[0]],
      flaecheninfo: [coordinates]
    });
  }





  if (conn) { 
    await conn.close();
  }


  return infoProductIDs;
}


async function getBestllungenFromUser(userID) {
  let conn
  let cart = {
    gesamtsummeInklMwst: null,
    gesamtsumme: null,
    mwst: null,
    products: []
  }

  try {
    conn = await oracledb.getConnection(config)


    
    //Gesamtsumme inkl. MwSt ermitteln
    let result = await conn.execute(
      'select GESAMTSUMME from WARENKORB where KUNDENNUMMER = :userID',[userID]
    )
    cart.gesamtsummeInklMwst = result.rows[0]
    
    //Alle Produkte des Warenkorbs des Users auslesen
    let result2 = await conn.execute('SELECT * from Produkt where ARTIKELNR IN (SELECT ARTIKELNR from WARENKORB_ENTHÄLT_PRODUKT where KUNDENNUMMER = :userID)',[userID])
    cart.products = result2.rows


    //Alle Produkte des Warenkorbs des Users auslesen
    let result43 = await conn.execute(`
    SELECT
    P.*,
    CASE WHEN PP.PROBENARTID IS NOT NULL THEN 'J' ELSE 'N' END AS enthält_mangat,
    CASE WHEN PP.PROBENARTID IS NOT NULL THEN PP.PROBENSTATUS ELSE 0 END AS statusmangat,
    CASE WHEN PE.PROBENARTID IS NOT NULL THEN 'J' ELSE 'N' END AS enthält_emin,
    CASE WHEN PE.PROBENARTID IS NOT NULL THEN PE.PROBENSTATUS ELSE 0 END AS statusemin,
    CASE WHEN PS.PROBENARTID IS NOT NULL THEN 'J' ELSE 'N' END AS enthält_stickstoff,
    CASE WHEN PS.PROBENARTID IS NOT NULL THEN PS.PROBENSTATUS ELSE 0 END AS statusstickstoff
    FROM
    Produkt P
JOIN
    Bestellung_enthält_Produkt B ON P.ARTIKELNR = B.ARTIKELNR
JOIN
    Bestellung O ON B.KUNDENNUMMER = O.KUNDENNUMMER
LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PP ON P.ARTIKELNR = PP.ARTIKELNR AND PP.PROBENARTID = 1
LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PE ON P.ARTIKELNR = PE.ARTIKELNR AND PE.PROBENARTID = 2
LEFT JOIN
    PRODUKT_ENTHÄLT_PROBE PS ON P.ARTIKELNR = PS.ARTIKELNR AND PS.PROBENARTID = 3
WHERE
    O.Kundennummer = :userID
`,[userID])

  cart.products = result43.rows

    //Gesamtsumme ohne MwSt Anteil berechnen
      const result3 = await conn.execute('select sum(PRODUKT.PREIS) from PRODUKT,WARENKORB_ENTHÄLT_PRODUKT where PRODUKT.ARTIKELNR = WARENKORB_ENTHÄLT_PRODUKT.ARTIKELNR AND WARENKORB_ENTHÄLT_PRODUKT.KUNDENNUMMER = :userID ',[userID])
      cart.gesamtsumme = result3.rows[0][0]
    
    //MwSt berechnen
      cart.mwst = cart.gesamtsummeInklMwst - cart.gesamtsumme

    return cart
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function getKundenDatenMitGeoDaten(geoID){
  try {
    conn = await oracledb.getConnection(config)

    const result =  await conn.execute(`SELECT
    Kunde.KUNDENNUMMER,
    Kunde.VORNAME,
    Kunde.NACHNAME,
    Kunde.E_MAIL,
    Kunde.TELEFONNUMMER,
    Adresse.ORT,
    COALESCE(COUNT(P.ARTIKELNR), 0) AS AnzahlFlaechen
    FROM
        Kunde
    JOIN
        Kunde_Hat_Adresse ON Kunde.KUNDENNUMMER = Kunde_Hat_Adresse.KUNDENNUMMER
    JOIN
        Adresse ON Kunde_Hat_Adresse.STRASSE = Adresse.STRASSE
        AND Kunde_Hat_Adresse.ORT = Adresse.ORT
        AND Kunde_Hat_Adresse.POSTLEITZAHL = Adresse.POSTLEITZAHL
        AND Kunde_Hat_Adresse.HAUSNUMMER = Adresse.HAUSNUMMER
    LEFT JOIN
        Bestellung ON Kunde.KUNDENNUMMER = Bestellung.KUNDENNUMMER
    LEFT JOIN
        Bestellung_enthält_Produkt B ON Bestellung.KUNDENNUMMER = B.KUNDENNUMMER
    LEFT JOIN
        Produkt P ON B.ARTIKELNR = P.ARTIKELNR
        where GEODATENGEBERID = :geoID
        GROUP BY
        Kunde.KUNDENNUMMER, Adresse.ORT, Kunde.TELEFONNUMMER, Kunde.VORNAME, Kunde.NACHNAME, Kunde.E_MAIL
    order by KUNDENNUMMER`,[geoID])
    
  
    return result.rows
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function getKundenDatenMitGeoDatenDieZuZiehenSind(geoID){
  try {
    conn = await oracledb.getConnection(config)

    const result =  await conn.execute(`SELECT
    Kunde.KUNDENNUMMER,
    Kunde.VORNAME,
    Kunde.NACHNAME,
    Kunde.E_MAIL,
    Kunde.TELEFONNUMMER,
    Adresse.ORT,
    COALESCE(COUNT(P.ARTIKELNR), 0) AS AnzahlFlaechen
    FROM
        Kunde
    JOIN
        Kunde_Hat_Adresse ON Kunde.KUNDENNUMMER = Kunde_Hat_Adresse.KUNDENNUMMER
    JOIN
        Adresse ON Kunde_Hat_Adresse.STRASSE = Adresse.STRASSE
        AND Kunde_Hat_Adresse.ORT = Adresse.ORT
        AND Kunde_Hat_Adresse.POSTLEITZAHL = Adresse.POSTLEITZAHL
        AND Kunde_Hat_Adresse.HAUSNUMMER = Adresse.HAUSNUMMER
    LEFT JOIN
        Bestellung ON Kunde.KUNDENNUMMER = Bestellung.KUNDENNUMMER
    LEFT JOIN
        Bestellung_enthält_Produkt B ON Bestellung.KUNDENNUMMER = B.KUNDENNUMMER
    LEFT JOIN
        Produkt P ON B.ARTIKELNR = P.ARTIKELNR
    LEFT JOIN PRODUKT_ENTHÄLT_PROBE PEP on P.ARTIKELNR = PEP.ARTIKELNR
        where GEODATENGEBERID = :geoID AND PEP.PROBENSTATUS = 1
        GROUP BY
        Kunde.KUNDENNUMMER, Adresse.ORT, Kunde.TELEFONNUMMER, Kunde.VORNAME, Kunde.NACHNAME, Kunde.E_MAIL
    order by KUNDENNUMMER`,[geoID])
    
  
    return result.rows
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getKundendatenDieZuZiehenSind(userID) {
  let conn
  let resultsKundendaten = {
    lufa: [],
    claas: [],
    gsagri: [],
    lwkniedersachsen: [],
    maehlmann: [],
    sonstiges: [],
  }
 
  try {
    conn = await oracledb.getConnection(config)
    console.log('resultclaas')



    const resultLufa = await  getKundenDatenMitGeoDatenDieZuZiehenSind(1)
    const resultclaas = await  getKundenDatenMitGeoDatenDieZuZiehenSind(2)
    const resultgsagri = await  getKundenDatenMitGeoDatenDieZuZiehenSind(3)
    const resultlwkniedersachsen = await  getKundenDatenMitGeoDatenDieZuZiehenSind(4)
    const resultmaehlmann = await  getKundenDatenMitGeoDatenDieZuZiehenSind(5)
    const resultsonsttiges = await  getKundenDatenMitGeoDatenDieZuZiehenSind(6)




    resultsKundendaten.lufa = resultLufa
    resultsKundendaten.claas = resultclaas
    resultsKundendaten.gsagri = resultgsagri
    resultsKundendaten.lwkniedersachsen = resultlwkniedersachsen
    resultsKundendaten.maehlmann = resultmaehlmann
    resultsKundendaten.sonstiges = resultsonsttiges
  
    return resultsKundendaten
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getKundendaten(userID) {
  let conn
  let resultsKundendaten = {
    lufa: [],
    claas: [],
    gsagri: [],
    lwkniedersachsen: [],
    maehlmann: [],
    sonstiges: [],
  }
 
  try {
    conn = await oracledb.getConnection(config)


    const resultLufa = await  getKundenDatenMitGeoDaten(1)
    const resultclaas = await  getKundenDatenMitGeoDaten(2)
    const resultgsagri = await  getKundenDatenMitGeoDaten(3)
    const resultlwkniedersachsen = await  getKundenDatenMitGeoDaten(4)
    const resultmaehlmann = await  getKundenDatenMitGeoDaten(5)
    const resultsonsttiges = await  getKundenDatenMitGeoDaten(6)



    resultsKundendaten.lufa = resultLufa
    resultsKundendaten.claas = resultclaas
    resultsKundendaten.gsagri = resultgsagri
    resultsKundendaten.lwkniedersachsen = resultlwkniedersachsen
    resultsKundendaten.maehlmann = resultmaehlmann
    resultsKundendaten.sonstiges = resultsonsttiges
  
    return resultsKundendaten
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getMitarbeiterdaten(userID) {
  let conn
  let results = []
  
  try {
    conn = await oracledb.getConnection(config)

    const result =  await conn.execute(`select * from MITARBEITER`)  
    results = result.rows
  
    return results
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function createCart(userID){
  let conn
  var productID = 0

  try {
    conn = await oracledb.getConnection(config)
    const hatWarenkorb = await conn.execute("select KUNDENNUMMER from WARENKORB where KUNDENNUMMER = :userID",[userID])

    try {
      if (hatWarenkorb.rows.length === 0) {
        // Es gibt keinen Warenkorb für diesen Benutzer, füge einen neuen Warenkorb hinzu
        await conn.execute('INSERT INTO WARENKORB (KUNDENNUMMER, ANZAHLPOSITIONEN, GESAMTSUMME) VALUES (:userID, 0, 0)', [userID]);
        conn.commit
      }

      productID = await conn.execute('select max(ARTIKELNR) from PRODUKT where Kundennummer  = :userID',[userID])
      productID = productID.rows[0][0];


    } catch (error) {
      console.error('Fehler beim Einfügen: Warenkorb ' + error.message);
    }    

    conn.commit()

    return { productID }; // otherData ist ein Platzhalter für andere Informationen, die du zurückgeben möchtest

  } catch (err) {
    console.log('Ouch!', err, productID,flaechenname,imageElement,fleachenartValue)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function createBestellung(userID){
  let conn

  try {
    conn = await oracledb.getConnection(config)
    const hatBestellung = await conn.execute("select KUNDENNUMMER from BESTELLUNG where Kundennummer = :userID",[userID])

    try {
      if (hatBestellung.rows.length === 0) {
        await conn.execute('INSERT INTO BESTELLUNG(KUNDENNUMMER, ZEITSTEMPEL) VALUES (:userID,sysdate)', [userID]);
        conn.commit
      }
    } catch (error) {
      console.error('Fehler beim Einfügen: Bestellung ' + error.message);
    }    

    conn.commit()

  } catch (err) {
    console.log('Ouch!', err, productID,flaechenname,imageElement,fleachenartValue)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function putToBestellung(selectedOption, userID,productID, flaechenname, dateValue,NminValue,MangatValue,StickstoffValue,coordinates,imageElement,fleachenartValue,gettiefenValue) {
  let conn


  try {
    conn = await oracledb.getConnection(config)    

    try {

      



      if(!productID){
        productID = await conn.execute('select max(ARTIKELNR) from PRODUKT where Kundennummer  = :userID',[userID])
        productID = productID.rows[0][0]+1;
      }


      await conn.execute("insert into PRODUKT (ARTIKELNR,FLÄCHENNAME,preis,FOTO,FLEACHENART,Kundennummer) VALUES (:productID,:flaechenname,7,:imageElement,:fleachenartValue,:userID)",[productID,flaechenname,imageElement,fleachenartValue,userID])
      await conn.execute("insert into PRODUKT_ENTHÄLT_TIEFE(ARTIKELNR, TIEFENID) VALUES (:productID,:gettiefenValue)",[productID,gettiefenValue])

      if(MangatValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[productID])
      } 
      
      if(NminValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[productID])
      }
  
      if(StickstoffValue==2){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,2,1)",[productID])
      } else if(StickstoffValue==3){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,3,1)",[productID])
      } else if(StickstoffValue==4){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,4,1)",[productID])
      }

      conn.commit
    } catch (error) {
      console.error('Fehler beim Einfügen FLEACHEN: ');
      // Hier kannst du Code hinzufügen, um mit dem nächsten Datensatz fortzufahren.
      
    }  
    
    for (let j = 0; j <= coordinates.length; j++) {
      var position = j+1;
      try {
        await conn.execute(
          "insert into FLEACHENKOORDINATE(FKOORDINATENIDLAT, FKOORDINATENIDLNG, ARTIKELNR,POSITIONSPUNKT) VALUES (:coordinateLAT, :coordinateLNG, :productID, :position)",
          {coordinateLAT: coordinates[j][0], coordinateLNG: coordinates[j][1], productID, position}
        );
      } catch (error) {
        //console.error('Fehler beim Einfügen FLEACHENKOORDINATE: ' + error.message, coordinates[j][0], coordinates[j][1], productID, position);
        break;
      }
    }
    await conn.execute('INSERT INTO BESTELLUNG_ENTHÄLT_PRODUKT (KUNDENNUMMER,ARTIKELNR) VALUES(:userID,:productID)',[userID,productID])
    conn.commit()
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function putToCart(selectedOption, userID,productID, flaechenname, dateValue,NminValue,MangatValue,StickstoffValue,coordinates,imageElement,fleachenartValue,gettiefenValue) {
  let conn


  try {
    conn = await oracledb.getConnection(config)
    
    
    try {

      if(productID === 'undefinedundefinedundefined'){
        productID = await conn.execute('select max(ARTIKELNR) from PRODUKT where Kundennummer  = :userID',[userID])
        productID = productID.rows[0][0]+1;
      }



      await conn.execute("insert into PRODUKT (ARTIKELNR,FLÄCHENNAME,preis,FOTO,FLEACHENART,Kundennummer) VALUES (:productID,:flaechenname,7,:imageElement,:fleachenartValue,:userID)",[productID,flaechenname,imageElement,fleachenartValue,userID])
      await conn.execute("insert into PRODUKT_ENTHÄLT_TIEFE(ARTIKELNR, TIEFENID) VALUES (:productID,:gettiefenValue)",[productID,gettiefenValue])

      if(MangatValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[productID])
      } 
      
      if(NminValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[productID])
      }
  
      if(StickstoffValue==2){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,2,1)",[productID])
      } else if(StickstoffValue==3){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,3,1)",[productID])
      } else if(StickstoffValue==4){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,4,1)",[productID])
      }

      conn.commit
    } catch (error) {
      console.error('Fehler beim Einfügen FLEACHEN: ' + error.message, productID, position);      
    }  


    
    
    for (let j = 0; j <= coordinates.length; j++) {
      var position = j+1;
    
      try {

        await conn.execute(
          "insert into FLEACHENKOORDINATE(FKOORDINATENIDLAT, FKOORDINATENIDLNG, ARTIKELNR,POSITIONSPUNKT) VALUES (:coordinateLAT, :coordinateLNG, :productID, :position)",
          {coordinateLAT: coordinates[j][0], coordinateLNG: coordinates[j][1], productID, position}
        );
      } catch (error) {
        //console.error('Fehler beim Einfügen FLEACHENKOORDINATE: ' + error.message, coordinates[j][0], coordinates[j][1], productID, position);
        // Hier kannst du Code hinzufügen, um mit dem nächsten Datensatz fortzufahren.
        break;
      }
    }

    



    

    await conn.execute('INSERT INTO WARENKORB_ENTHÄLT_PRODUKT (KUNDENNUMMER,ARTIKELNR) VALUES(:userID,:productID)',[userID,productID])
    conn.commit()

    //TODO GHET ES VOLLKOMMEN DURCH BZW WARUM NICHT
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}



async function anderPasswort(userID,passwordNewInput) {
  let conn

  try {
    conn = await oracledb.getConnection(config)
    await conn.execute('update kunde set PASSWORD = :passwordNewInput where KUNDENNUMMER= :userID',[passwordNewInput, userID])
    conn.commit()
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getAllProducts () {
  let conn
  pageNumber = 2

  try {
    conn = await oracledb.getConnection(config)

    var pageNumber = 1

    const result = await conn.execute(
      "select * from Produkt where ARTIKELNR >= 8*(:pageNumber-1) AND ARTIKELNR < 8*:pageNumber order by ARTIKELNR",[pageNumber]
    )
    return(result)

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getBestseller () {
  let conn
  pageNumber = 2

  try {
    conn = await oracledb.getConnection(config)

    var pageNumber = 2

    const result = await conn.execute(      
      "SELECT p.ARTIKELNR, p.PREIS, p.PRODUKTBEZEICHNUNG, p.NAME, (SELECT COUNT(*) FROM BESTELLTUNG_ENTHÄLT_PRODUKT b WHERE b.ARTIKELNR = p.ARTIKELNR) as Anzahl FROM Produkt p ORDER BY (SELECT COUNT(*) FROM BESTELLTUNG_ENTHÄLT_PRODUKT b WHERE b.ARTIKELNR = p.ARTIKELNR) DESC FETCH FIRST 102 ROWS ONLY"
    )
    return(result)

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function getResultPreis () {
  let conn
  pageNumber = 2

  try {
    conn = await oracledb.getConnection(config)

    var pageNumber = 2

    const result = await conn.execute(
      "SELECT * FROM PRODUKT WHERE PREIS > 1 AND PREIS <= 2 ORDER BY (CASE WHEN PRODUKTBEZEICHNUNG = 'dummy' THEN 1 ELSE 0 END), PREIS asc"
    )
    return(result)

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getResultLast () {
  let conn
  pageNumber = 2

  try {
    conn = await oracledb.getConnection(config)

    var pageNumber = 2

    const result = await conn.execute(
      "SELECT * FROM Produkt WHERE ARTIKELNR IN (SELECT t.ARTIKELNR FROM (select * from BESTELLTUNG_ENTHÄLT_PRODUKT order by BESTELLNUMMER desc FETCH FIRST 23 ROWS ONLY) t ) order by ARTIKELNR"      
    )
    return(result)

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function getResultKategorien (artikelnr) {
  let conn
  pageNumber = 2

  try {
    conn = await oracledb.getConnection(config)

    var pageNumber = 2

    const result = await conn.execute(
      "SELECT p.*,(SELECT COUNT(*) FROM BESTELLTUNG_ENTHÄLT_PRODUKT bep WHERE bep.ARTIKELNR = p.ARTIKELNR) AS AnzahlBestellungen FROM Produkt p WHERE p.NAME = (select name from PRODUKT where ARTIKELNR = :artikelnr) AND p.ARTIKELNR != :artikelnr ORDER BY AnzahlBestellungen DESC",[artikelnr,artikelnr]
    )
    return(result)

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function getProductDetails (productIdReq) {
  let conn

  try {
    conn = await oracledb.getConnection(config)

    const result = await conn.execute(
        'select * from PRODUKT where ARTIKELNR = :id',[productIdReq]
    )
    return(result.rows)

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getAllOberCategories () {
  let conn

  try {
    conn = await oracledb.getConnection(config)

    const result = await conn.execute(
      'select distinct NAME_1 from ENTHÄLT_SUBKATEGORIE where NAME_1 not in (select NAME_2 from ENTHÄLT_SUBKATEGORIE)'
    )
    return(result)

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getProductsByCategory(category) {
  let conn

  try {
    conn = await oracledb.getConnection(config)

    const result = await conn.execute(
      "SELECT * FROM produkt WHERE name = :cate ORDER BY (CASE WHEN PRODUKTBEZEICHNUNG = 'dummy' THEN 1 ELSE 0 END), PRODUKTBEZEICHNUNG ASC",[category]//'%' + category+ '%'
    )
    return(result)

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function registerUser(email, telefonnummer, password, vorname, nachname, geburtsdatum, ort, plz, strasse, hausnummer) { //req.body.email, hashedPassword,req.body.vorname, req.body.nachname,req.body.date
  let conn
  try {
    conn = await oracledb.getConnection(config)

    const neuesteKundennummer = await conn.execute(
      'SELECT  max(KUNDENNUMMER) From KUNDE'
    )

    const neuesteKundennummerNEU = neuesteKundennummer.rows[0][0]+1;

    const result = await conn.execute(
      "INSERT INTO KUNDE (Kundennummer, E_MAIL,Telefonnummer,PASSWORD,VORNAME,NACHNAME,GEBURTSDATUM, KundeSeit) VALUES (:neuesteKundennummerNEU,:email,:telefonnummer,:password,:vorname,:nachname,TO_DATE(:geburtsdatum,'yyyy-mm-dd'),sysdate)",
      [neuesteKundennummerNEU,email,telefonnummer,password,vorname,nachname,geburtsdatum]
    )
      //Check if Adresse schon vorhanden
      result4 = await conn.execute('SELECT * FROM ADRESSE WHERE STRASSE = :strasse AND POSTLEITZAHL = :plz AND HAUSNUMMER = :hnr AND ORT = :ort',[strasse,plz,hausnummer,ort])
      
      if(result4.rows.length > 0){
        conn.execute('UPDATE ADRESSE SET ISTRECHNUNGSADRESSE=1, ISTLIEFERADRESSE=1')
      }else{
        conn.execute("INSERT INTO ADRESSE (STRASSE,POSTLEITZAHL,HAUSNUMMER,ORT,ISTWOHNADRESSE, ISTRECHNUNGSADRESSE, ISTLIEFERADRESSE, ISTSTANDORTSADRESSE) VALUES (:strasse,:plz,:hausnummer,:ort,0,1,1,0)",
        [strasse,plz,hausnummer,ort])
      }

    const result3 = await conn.execute(
      "INSERT INTO KUNDE_HAT_ADRESSE (KUNDENNUMMER,STRASSE,POSTLEITZAHL,HAUSNUMMER,ORT) VALUES (:neuesteKundennummer,:strasse,:plz,:hausnummer,:ort)",
      [neuesteKundennummerNEU,strasse,plz,hausnummer,ort]
    )

    conn.commit;




  } catch (err) {
    console.log('User could not be registered', err)
    throw err
  } finally {
    conn.commit()
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function registerUserWithFleachen(kundennummer, email, telefonnummer, password, vorname, nachname, geburtsdatum, ort, plz, strasse, hausnummer, selectedOption) { //req.body.email, hashedPassword,req.body.vorname, req.body.nachname,req.body.date
  let conn

  try {
    conn = await oracledb.getConnection(config)
    if(selectedOption > 1){
      kundennummer = await conn.execute('select max(KUNDENNUMMER) from Kunde where GEODATENGEBERID  != 1')
      kundennummer = kundennummer.rows[0][0]+1;
    }



    const result = await conn.execute(
      "INSERT INTO KUNDE (Kundennummer, E_MAIL,Telefonnummer,PASSWORD,VORNAME,NACHNAME,GEBURTSDATUM, KundeSeit,GEODATENGEBERID) VALUES (:kundennummer,:email,:telefonnummer,:password,:vorname,:nachname,TO_DATE(:geburtsdatum,'yyyy-mm-dd'),sysdate,:selectedOption)",
      [kundennummer,email,telefonnummer,password,vorname,nachname,geburtsdatum,selectedOption]
    )
    

    ort = ort ? ort : 'null';
    plz = plz ? plz : 0;
    strasse = strasse ? strasse : 'null';
    hausnummer = hausnummer ? hausnummer : 0;


    //Check if Adresse schon vorhanden
    result4 = await conn.execute('SELECT * FROM ADRESSE WHERE STRASSE = :strasse AND POSTLEITZAHL = :plz AND HAUSNUMMER = :hnr AND ORT = :ort',[strasse,plz,hausnummer,ort])
    
    if(result4.rows.length > 0){
      conn.execute('UPDATE ADRESSE SET ISTRECHNUNGSADRESSE=1, ISTLIEFERADRESSE=1')
    }else{
      conn.execute("INSERT INTO ADRESSE (STRASSE,POSTLEITZAHL,HAUSNUMMER,ORT,ISTWOHNADRESSE, ISTRECHNUNGSADRESSE, ISTLIEFERADRESSE, ISTSTANDORTSADRESSE) VALUES (:strasse,:plz,:hausnummer,:ort,0,1,1,0)",
      [strasse,plz,hausnummer,ort])
    }

    const result3 = await conn.execute(
      "INSERT INTO KUNDE_HAT_ADRESSE (KUNDENNUMMER,STRASSE,POSTLEITZAHL,HAUSNUMMER,ORT) VALUES (:neuesteKundennummer,:strasse,:plz,:hausnummer,:ort)",
      [kundennummer,strasse,plz,hausnummer,ort]
    )

    conn.commit;

    
    return { kundennummer }; // otherData ist ein Platzhalter für andere Informationen, die du zurückgeben möchtest

    




  } catch (err) {
    console.log('User could not be registered', err)
    var statusCode = 123
    return { kundennummer, statusCode}; // otherData ist ein Platzhalter für andere Informationen, die du zurückgeben möchtest
    throw err
  } finally {
    conn.commit()
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getUserByEmail(email) {
  let conn
  const user = {
    email: null,
    password: null,
    id: null
  }
  try {
    conn = await oracledb.getConnection(config)    
    const result = await conn.execute(
      'SELECT E_MAIL, PASSWORD, Personalnummer FROM MITARBEITER WHERE E_MAIL = :email',[email]
    )



    /*const result = await conn.execute(
      'SELECT E_MAIL, PASSWORD, KUNDENNUMMER FROM KUNDE WHERE E_MAIL = :email',[email]
    )*/
      if(result.rows.length > 0){
        user.email = result.rows[0][0]
        user.password = result.rows[0][1]
        user.id = result.rows[0][2]
    }
      return user
      
  } catch (err) {
    console.log('Error Reading User', err)
    throw err
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getUserById(id) {
  let conn
  const user = {
    email: null ,
    password: null,
    id: null
  }
  try {
    conn = await oracledb.getConnection(config)

    const result = await conn.execute(
      'SELECT E_MAIL, PASSWORD, KUNDENNUMMER FROM KUNDE WHERE Kundennummer = :id',[id]
    )
      if(result.rows.length > 0){
        user.email = result.rows[0][0]
        user.password = result.rows[0][1]
        user.id = result.rows[0][2]
    }
      return user
      
  } catch (err) {
    console.log('Error Reading User', err)
    throw err
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getSub(toGet){
  let conn

  try {
    conn = await oracledb.getConnection(config)

    const result = await conn.execute(
      'select NAME_2 from ENTHÄLT_SUBKATEGORIE WHERE NAME_1 = :cate',[toGet]
    )
    return(result)

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function getSubs(searchForSubs){
  let conn
  try {
    conn = await oracledb.getConnection(config)
    let foundSubcategories = (await conn.execute('SELECT NAME_2 FROM ENTHÄLT_SUBKATEGORIE WHERE NAME_1 = :searchForSub',[searchForSubs])).rows

    return foundSubcategories
  } catch (error) {
    
  }finally{
    conn.close()
  }
}


async function getCategorys (){
  let conn
  try {
    conn = await oracledb.getConnection(config)
    let TopCategories = (await conn.execute('select distinct NAME_1 from ENTHÄLT_SUBKATEGORIE where NAME_1 not in (select NAME_2 from ENTHÄLT_SUBKATEGORIE)')).rows
    let finalHierarchie = []
    for (let index = 0; index < TopCategories.length; index++) {
      let subCategories = await getSubs(TopCategories[index][0])
      
      for (let j = 0; j < subCategories.length; j++) {

        finalHierarchie[index]= [TopCategories[index][0],]
        
      }
      
    }


    return finalHierarchie

  } catch (error) {
    
  }finally{
    if(conn){
      conn.close()
    }
  }


}



async function getClob(userID){
  let conn

  try {
    conn = await oracledb.getConnection(config)
    oracledb.fetchAsString = [ oracledb.CLOB ]
    const result = await conn.execute(
      `
      SELECT
      P.ARTIKELNR,P.FOTO
      FROM
      Produkt P
  JOIN
      Bestellung_enthält_Produkt B ON P.ARTIKELNR = B.ARTIKELNR
  JOIN
      Bestellung O ON B.KUNDENNUMMER = O.KUNDENNUMMER
  WHERE
      O.Kundennummer = :userID`, [userID])
      //'select ARTIKELNR, foto from PRODUKT',
     // 'select JSON from KATEGORIEABFRAGE',
    //)
    return result

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}


async function getClobWaren(userID){
  let conn

  try {
    conn = await oracledb.getConnection(config)
    oracledb.fetchAsString = [ oracledb.CLOB ]
    const result = await conn.execute(
      `
      SELECT
      P.ARTIKELNR,P.FOTO
      FROM
      Produkt P
  JOIN
      Bestellung_enthält_Produkt B ON P.ARTIKELNR = B.ARTIKELNR
  JOIN
      Bestellung O ON B.Kundennummer = O.Kundennummer
  WHERE
      O.Kundennummer = :userID`, [userID])
    return result

  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}



async function getSuggestions(artikelnr){
  let conn
  bind = [artikelnr,artikelnr]


  try {
    conn = await oracledb.getConnection(config)
    const query = 'SELECT ARTIKELNR, PREIS, PRODUKTBEZEICHNUNG, HERSTELLER, NETTOGEWICHT, BRUTTOGEWICHT, RECYCLEBAREVERPACKUNG, NAME, SKU, KONFIDENZ, LIFT, SUPPORT, MAX(LIFTxKONFIDENZ) AS LIFTxKONFIDENZ2, MAX(LIFTxKONFIDENZxSUPPORT) AS LIFTxKONFIDENZxSUPPORT2    FROM ( SELECT p.ARTIKELNR, p.PREIS, p.PRODUKTBEZEICHNUNG, p.HERSTELLER, p.NETTOGEWICHT, p.BRUTTOGEWICHT, p.RECYCLEBAREVERPACKUNG, p.NAME, p.SKU, KONFIDENZ, LIFT, SUPPORT, (LIFT*KONFIDENZ) AS LIFTxKONFIDENZ, (LIFT*SUPPORT*KONFIDENZ) AS LIFTxKONFIDENZxSUPPORT FROM DEVSHOP2.PRODUKT p JOIN (                SELECT DISTINCT CONSEQUENCE, KONFIDENZ, LIFT, SUPPORT FROM (                    SELECT DISTINCT r.CONSEQUENCE, KONFIDENZ, r.LIFT, SUPPORT FROM DEVSHOP2.ALLGEMEINEARTIKELREGEL r JOIN (                        SELECT a.ITEMSET_ID, a.ARTIKELNR FROM DEVSHOP2.ALLGEMEINEARTIKELITEMS a JOIN DEVSHOP2.ALLGEMEINEARTIKELREGEL r ON a.ITEMSET_ID = r.ITEMSET_ID                            WHERE a.ARTIKELNR IN (:artikelnr)                            AND ITEM_COUNT = 2                            AND a.ARTIKELNR != r.CONSEQUENCE                            AND r.LIFT >= 1                            GROUP BY a.ITEMSET_ID, a.ARTIKELNR, LIFT                        ) ex ON r.ITEMSET_ID = ex.ITEMSET_ID AND r.CONSEQUENCE != ex.ARTIKELNR                        WHERE r.CONSEQUENCE NOT IN (:artikelnr) AND r.LIFT>=1                        GROUP BY r.CONSEQUENCE, r.LIFT, KONFIDENZ, SUPPORT                    )                GROUP BY CONSEQUENCE, LIFT, KONFIDENZ, SUPPORT                ) ON CONSEQUENCE = p.ARTIKELNR            group by LIFT, KONFIDENZ, SUPPORT, p.ARTIKELNR, p.PREIS, p.PRODUKTBEZEICHNUNG, p.HERSTELLER, p.NETTOGEWICHT, p.BRUTTOGEWICHT, p.RECYCLEBAREVERPACKUNG, p.NAME, p.SKU            UNION            SELECT p.ARTIKELNR, p.PREIS, p.PRODUKTBEZEICHNUNG, p.HERSTELLER, p.NETTOGEWICHT, p.BRUTTOGEWICHT, p.RECYCLEBAREVERPACKUNG, p.NAME, p.SKU, KONFIDENZ, LIFT, SUPPORT, (LIFT*KONFIDENZ) AS LIFTxKONFIDENZ, (LIFT*SUPPORT*KONFIDENZ) AS LIFTxKONFIDENZxSUPPORT FROM DEVSHOP2.PRODUKT p JOIN (                SELECT DISTINCT CONSEQUENCE, KONFIDENZ, LIFT, SUPPORT FROM (                    SELECT DISTINCT r.CONSEQUENCE, KONFIDENZ, r.LIFT, SUPPORT FROM DEVSHOP2.GENAUEARTIKELREGEL r JOIN (                        SELECT a.ITEMSET_ID, a.ARTIKELNR FROM DEVSHOP2.GENAUEARTIKELITEMS a JOIN DEVSHOP2.GENAUEARTIKELREGEL r ON a.ITEMSET_ID = r.ITEMSET_ID                            WHERE a.ARTIKELNR IN (:artikelnr)                            AND ITEM_COUNT = 2                            AND a.ARTIKELNR != r.CONSEQUENCE                            AND r.LIFT >= 3.2                            GROUP BY a.ITEMSET_ID, a.ARTIKELNR, LIFT                        ) ex ON r.ITEMSET_ID = ex.ITEMSET_ID AND r.CONSEQUENCE != ex.ARTIKELNR                        WHERE r.CONSEQUENCE NOT IN (:artikelnr) AND r.LIFT>=3.2                        GROUP BY r.CONSEQUENCE, r.LIFT, KONFIDENZ, SUPPORT                    )                GROUP BY CONSEQUENCE, LIFT, KONFIDENZ, SUPPORT                ) ON CONSEQUENCE = p.ARTIKELNR            group by LIFT, KONFIDENZ, SUPPORT, p.ARTIKELNR, p.PREIS, p.PRODUKTBEZEICHNUNG, p.HERSTELLER, p.NETTOGEWICHT, p.BRUTTOGEWICHT, p.RECYCLEBAREVERPACKUNG, p.NAME, p.SKU            )        group by ARTIKELNR, PREIS, PRODUKTBEZEICHNUNG, HERSTELLER, NETTOGEWICHT, BRUTTOGEWICHT, RECYCLEBAREVERPACKUNG, NAME, SKU, LIFT, KONFIDENZ, SUPPORT, LIFTxKONFIDENZ, LIFTxKONFIDENZxSUPPORT ORDER BY LIFTxKONFIDENZ2 desc'
    const result = await conn.execute(query, bind)

    return result.rows
   

  } catch (err) {
    console.log('Ouch!', err)
  }
}

async function getCartSuggestions(cartArtikelNumbers){
  let conn
  let searchNums = ''
  for (let index = 0; index < cartArtikelNumbers.length; index++) {
    searchNums = searchNums + cartArtikelNumbers[index]
    if(index != cartArtikelNumbers.length -1){
      searchNums=searchNums + ','
    }
  }
  try {
    conn = await oracledb.getConnection(config)
    //'+searchNums+'
    const query = 'SELECT ARTIKELNR, PREIS, PRODUKTBEZEICHNUNG, HERSTELLER, NETTOGEWICHT, BRUTTOGEWICHT, RECYCLEBAREVERPACKUNG, NAME, SKU, SUM(KONFIDENZ_SUMM) AS KONFIDENZ_SUMME, SUM(LIFT_SUMM) AS LIFT_SUMME, SUM(SUPPORT_SUMM) AS SUPPORT_SUMME, SUM(LIFTxKONFIDENZ) AS LIFTxKONFIDENZ2, SUM(LIFTxKONFIDENZxSUPPORT) AS LIFTxKONFIDENZxSUPPORT2    FROM (SELECT CONSEQUENCE AS ARTIKELNR, p.PREIS, p.PRODUKTBEZEICHNUNG, p.HERSTELLER, p.NETTOGEWICHT, p.BRUTTOGEWICHT, p.RECYCLEBAREVERPACKUNG, p.NAME, p.SKU, SUM(KONFIDENZ_SUM2) AS KONFIDENZ_SUMM, SUM(LIFT_SUM2) AS LIFT_SUMM, SUM(SUPPORT_SUM2) AS SUPPORT_SUMM, (LIFT_SUM2*KONFIDENZ_SUM2) AS LIFTxKONFIDENZ, (LIFT_SUM2*SUPPORT_SUM2*KONFIDENZ_SUM2) AS LIFTxKONFIDENZxSUPPORT FROM DEVSHOP2.PRODUKT p join (                    SELECT CONSEQUENCE, SUM(KONFIDENZ_SUM) as KONFIDENZ_SUM2, SUM(LIFT_SUM) as LIFT_SUM2, SUM(SUPPORT_SUM) as SUPPORT_SUM2                        FROM (SELECT r.CONSEQUENCE, SUM(r.KONFIDENZ) as KONFIDENZ_SUM, SUM(r.LIFT) as LIFT_SUM, SUM(r.SUPPORT) as SUPPORT_SUM                              FROM DEVSHOP2.ALLGEMEINEARTIKELREGEL r                                       JOIN (SELECT a.ITEMSET_ID, a.ARTIKELNR                                             FROM DEVSHOP2.ALLGEMEINEARTIKELITEMS a JOIN DEVSHOP2.ALLGEMEINEARTIKELREGEL r ON a.ITEMSET_ID = r.ITEMSET_ID                                             WHERE a.ARTIKELNR IN ('+searchNums+')                                                AND ITEM_COUNT = 2                                                AND a.ARTIKELNR != r.CONSEQUENCE AND LIFT >= 1                                             GROUP BY a.ITEMSET_ID, a.ARTIKELNR) ex                                            ON r.ITEMSET_ID = ex.ITEMSET_ID AND r.CONSEQUENCE != ex.ARTIKELNR                              WHERE r.CONSEQUENCE NOT IN ('+searchNums+') AND LIFT >= 1                              GROUP BY r.CONSEQUENCE                              UNION                              SELECT r.CONSEQUENCE, SUM(r.KONFIDENZ) as KONFIDENZ_SUM, SUM(r.LIFT) as LIFT_SUM, SUM(r.SUPPORT) as SUPPORT_SUM                              FROM DEVSHOP2.ALLGEMEINEARTIKELITEMS a                                       JOIN DEVSHOP2.ALLGEMEINEARTIKELREGEL r ON a.ITEMSET_ID = r.ITEMSET_ID                                       JOIN (SELECT a.ITEMSET_ID, COUNT(DISTINCT a.ARTIKELNR)                                             FROM DEVSHOP2.ALLGEMEINEARTIKELITEMS a                                             WHERE a.ARTIKELNR IN ('+searchNums+')                                             GROUP BY a.ITEMSET_ID                                             HAVING COUNT(DISTINCT a.ARTIKELNR) >= 2) ex                                            ON r.ITEMSET_ID = ex.ITEMSET_ID AND r.CONSEQUENCE NOT IN ('+searchNums+') AND r.ITEM_COUNT > 2                              WHERE a.ARTIKELNR IN ('+searchNums+') AND LIFT >= 1 AND ITEM_COUNT = 3                              GROUP BY r.CONSEQUENCE                              UNION                              SELECT r.CONSEQUENCE, SUM(r.KONFIDENZ) as KONFIDENZ_SUM, SUM(r.LIFT) as LIFT_SUM, SUM(r.SUPPORT) as SUPPORT_SUM                              FROM DEVSHOP2.ALLGEMEINEARTIKELITEMS a                                       JOIN DEVSHOP2.ALLGEMEINEARTIKELREGEL r ON a.ITEMSET_ID = r.ITEMSET_ID                                       JOIN (SELECT a.ITEMSET_ID, COUNT(DISTINCT a.ARTIKELNR)                                             FROM DEVSHOP2.ALLGEMEINEARTIKELITEMS a                                             WHERE a.ARTIKELNR IN ('+searchNums+')                                             GROUP BY a.ITEMSET_ID                                             HAVING COUNT(DISTINCT a.ARTIKELNR) >= 3) ex                                            ON r.ITEMSET_ID = ex.ITEMSET_ID AND r.CONSEQUENCE NOT IN ('+searchNums+') AND r.ITEM_COUNT > 3                              WHERE a.ARTIKELNR IN ('+searchNums+') AND r.LIFT >= 1 AND ITEM_COUNT = 4                              GROUP BY r.CONSEQUENCE)                    group by CONSEQUENCE)            on CONSEQUENCE= p.ARTIKELNR group by CONSEQUENCE, p.PREIS, p.PRODUKTBEZEICHNUNG, p.HERSTELLER, p.NETTOGEWICHT, p.BRUTTOGEWICHT, p.RECYCLEBAREVERPACKUNG, p.NAME, p.SKU, (LIFT_SUM2*KONFIDENZ_SUM2), (LIFT_SUM2*SUPPORT_SUM2*KONFIDENZ_SUM2)          UNION          SELECT CONSEQUENCE AS ARTIKELNR, p.PREIS, p.PRODUKTBEZEICHNUNG, p.HERSTELLER, p.NETTOGEWICHT, p.BRUTTOGEWICHT, p.RECYCLEBAREVERPACKUNG, p.NAME, p.SKU, SUM(KONFIDENZ_SUM2) AS KONFIDENZ_SUMM, SUM(LIFT_SUM2) AS LIFT_SUMM, SUM(SUPPORT_SUM2) AS SUPPORT_SUMM, (LIFT_SUM2*KONFIDENZ_SUM2) AS LIFTxKONFIDENZ, (LIFT_SUM2*SUPPORT_SUM2*KONFIDENZ_SUM2) AS LIFTxKONFIDENZxSUPPORT FROM DEVSHOP2.PRODUKT p join (                     SELECT CONSEQUENCE, SUM(KONFIDENZ_SUM) as KONFIDENZ_SUM2, SUM(LIFT_SUM) as LIFT_SUM2, SUM(SUPPORT_SUM) as SUPPORT_SUM2                        FROM (SELECT r.CONSEQUENCE, SUM(r.KONFIDENZ) as KONFIDENZ_SUM, SUM(r.LIFT) as LIFT_SUM, SUM(r.SUPPORT) as SUPPORT_SUM                              FROM DEVSHOP2.GENAUEARTIKELREGEL r                                       JOIN (SELECT a.ITEMSET_ID, a.ARTIKELNR                                             FROM DEVSHOP2.GENAUEARTIKELITEMS a JOIN DEVSHOP2.GENAUEARTIKELREGEL r ON a.ITEMSET_ID = r.ITEMSET_ID                                             WHERE a.ARTIKELNR IN ('+searchNums+')                                               AND ITEM_COUNT = 2                                               AND a.ARTIKELNR != r.CONSEQUENCE                                             GROUP BY a.ITEMSET_ID, a.ARTIKELNR) ex                                            ON r.ITEMSET_ID = ex.ITEMSET_ID AND r.CONSEQUENCE != ex.ARTIKELNR                              WHERE r.CONSEQUENCE NOT IN ('+searchNums+') AND r.LIFT >= 3.2                              GROUP BY r.CONSEQUENCE                              UNION                              SELECT r.CONSEQUENCE, SUM(r.KONFIDENZ) as KONFIDENZ_SUM, SUM(r.LIFT) as LIFT_SUM, SUM(r.SUPPORT) as SUPPORT_SUM                                FROM DEVSHOP2.GENAUEARTIKELITEMS a                                       JOIN DEVSHOP2.GENAUEARTIKELREGEL r ON a.ITEMSET_ID = r.ITEMSET_ID                                       JOIN (SELECT a.ITEMSET_ID, COUNT(DISTINCT a.ARTIKELNR)                                             FROM DEVSHOP2.GENAUEARTIKELITEMS a                                             WHERE a.ARTIKELNR IN ('+searchNums+')                                             GROUP BY a.ITEMSET_ID                                             HAVING COUNT(DISTINCT a.ARTIKELNR) >= 2) ex                                            ON r.ITEMSET_ID = ex.ITEMSET_ID AND r.CONSEQUENCE NOT IN ('+searchNums+') AND r.ITEM_COUNT > 2                              WHERE a.ARTIKELNR IN ('+searchNums+')  AND r.LIFT >= 3.2 AND ITEM_COUNT = 3                              GROUP BY r.CONSEQUENCE                              UNION                              SELECT r.CONSEQUENCE, SUM(r.KONFIDENZ) as KONFIDENZ_SUM, SUM(r.LIFT) as LIFT_SUM, SUM(r.SUPPORT) as SUPPORT_SUM                                FROM DEVSHOP2.GENAUEARTIKELITEMS a                                       JOIN DEVSHOP2.GENAUEARTIKELREGEL r ON a.ITEMSET_ID = r.ITEMSET_ID                                       JOIN (SELECT a.ITEMSET_ID, COUNT(DISTINCT a.ARTIKELNR)                                             FROM DEVSHOP2.GENAUEARTIKELITEMS a                                             WHERE a.ARTIKELNR IN ('+searchNums+')                                             GROUP BY a.ITEMSET_ID                                             HAVING COUNT(DISTINCT a.ARTIKELNR) >= 3) ex                                            ON r.ITEMSET_ID = ex.ITEMSET_ID AND r.CONSEQUENCE NOT IN ('+searchNums+') AND r.ITEM_COUNT > 3                              WHERE a.ARTIKELNR IN ('+searchNums+') AND r.LIFT >= 3.2 AND ITEM_COUNT = 4                              GROUP BY r.CONSEQUENCE)                    group by CONSEQUENCE, KONFIDENZ_SUM, LIFT_SUM, SUPPORT_SUM)          on CONSEQUENCE= p.ARTIKELNR group by CONSEQUENCE, (LIFT_SUM2*KONFIDENZ_SUM2), (LIFT_SUM2*SUPPORT_SUM2*KONFIDENZ_SUM2), p.PREIS, p.PRODUKTBEZEICHNUNG, p.HERSTELLER, p.NETTOGEWICHT, p.BRUTTOGEWICHT, p.RECYCLEBAREVERPACKUNG, p.NAME, p.SKU)    group by ARTIKELNR, ARTIKELNR, PREIS, PRODUKTBEZEICHNUNG, HERSTELLER, NETTOGEWICHT, BRUTTOGEWICHT, RECYCLEBAREVERPACKUNG, NAME, SKU ORDER BY LIFTxKONFIDENZxSUPPORT2 desc FETCH FIRST 13 ROWS ONLY'
    const result = await conn.execute(query)

    return result


  } catch (error) {
    console.log('Ouch!',error)
  }
}


async function getfleachenFromUser(userID) {
  let conn
  let fleachen

  try {
    conn = await oracledb.getConnection(config)
    
    

    //Alle Produkte des Warenkorbs des Users auslesen
    fleachen = await conn.execute(`
 
SELECT DISTINCT fc.ARTIKELNR, fc.FKOORDINATENIDLAT, fc.FKOORDINATENIDLNG,  fc.POSITIONSPUNKT
FROM FLEACHENKOORDINATE fc
JOIN PRODUKT p ON p.ARTIKELNR = fc.ARTIKELNR
JOIN WARENKORB_ENTHÄLT_PRODUKT wp ON wp.ARTIKELNR = p.ARTIKELNR
JOIN WARENKORB w ON w.KUNDENNUMMER = wp.KUNDENNUMMER
JOIN KUNDE k ON k.KUNDENNUMMER = w.KUNDENNUMMER
WHERE K.KUNDENNUMMER = :userID
order by fc.ARTIKELNR, fc.POSITIONSPUNKT
`,[userID]);

    return fleachen
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}



async function beiEinemKundenDieFleachenHinzufügen(uebergebeneInformation) {
  let conn
  try {
    conn = await oracledb.getConnection(config)

    for (const fleachenInformationen of uebergebeneInformation) {
  
      if(fleachenInformationen.productid === 'undefinedundefinedundefined'){
        fleachenInformationen.productid = await conn.execute('select max(ARTIKELNR) from PRODUKT where Kundennummer  = :userID',[fleachenInformationen.USERID])
        fleachenInformationen.productid = fleachenInformationen.productid.rows[0][0]+1;
      }

      await conn.execute("insert into PRODUKT (ARTIKELNR,FLÄCHENNAME,preis,FOTO,FLEACHENART,Kundennummer) VALUES (:productID,:flaechenname,7,:imageElement,:fleachenartValue,:userID)",[fleachenInformationen.productid,fleachenInformationen.flaechenname,fleachenInformationen.imageElement,fleachenInformationen.fleachenart,fleachenInformationen.USERID])
      await conn.execute("insert into PRODUKT_ENTHÄLT_TIEFE(ARTIKELNR, TIEFENID) VALUES (:productID,:gettiefenValue)",[fleachenInformationen.productid,fleachenInformationen.tiefenValue])

      if(fleachenInformationen.MangatValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[fleachenInformationen.productid])
      } 
      
      if(fleachenInformationen.EminValue=='j'){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[fleachenInformationen.productid])
      }
  
      if(fleachenInformationen.StickstoffValue==2){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,2,1)",[fleachenInformationen.productid])
      } else if(fleachenInformationen.StickstoffValue==3){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,3,1)",[fleachenInformationen.productid])
      } else if(fleachenInformationen.StickstoffValue==4){
        await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,4,1)",[fleachenInformationen.productid])
      }
               
      for (let j = 0; j <= fleachenInformationen.coordinates.length; j++) {
        try{
          var position = j+1;  
          await conn.execute(
            "insert into FLEACHENKOORDINATE(FKOORDINATENIDLAT, FKOORDINATENIDLNG, ARTIKELNR,POSITIONSPUNKT) VALUES (:coordinateLAT, :coordinateLNG, :productID, :position)",
            {coordinateLAT: fleachenInformationen.coordinates[j][0], coordinateLNG: fleachenInformationen.coordinates[j][1], productID: fleachenInformationen.productid, position}
          );
        } catch (error) {
          break;
        }
      }

      await conn.execute('INSERT INTO BESTELLUNG_ENTHÄLT_PRODUKT (KUNDENNUMMER,ARTIKELNR) VALUES(:userID,:productID)',[fleachenInformationen.USERID,fleachenInformationen.productid])
    }
    
    conn.commit()

    //TODO GHET ES VOLLKOMMEN DURCH BZW WARUM NICHT
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function beiMehrerenKundenDieFleachenHinzufügen(res, uebergebeneInformation) {
  let conn


  try {
    conn = await oracledb.getConnection(config)
    for (const einzelneInformationen of uebergebeneInformation) {
      console.log(einzelneInformationen[0].USERID)

      /*
              USERID: Kundennummer,
        productid: FleachenID,
        flaechenname: schlagBez,
        dateValue: dateValue,
        EminValue: 'j',
        MangatValue: 'n',
        StickstoffValue: 'n',
        coordinates: coordinatesArray,
        imageElement: image,
        fleachenart: NUTZUNG,
        tiefenValue: 1,
        selectedOption : selectedOption   
        */


      if(einzelneInformationen[0].selectedOption > 1){
        einzelneInformationen[0].USERID = await conn.execute('select max(KUNDENNUMMER) from Kunde where GEODATENGEBERID  != 1')
        einzelneInformationen[0].USERID = einzelneInformationen[0].USERID.rows[0][0]+1;
      }


  
      const result = await conn.execute(
        "INSERT INTO KUNDE (Kundennummer,KundeSeit,GEODATENGEBERID) VALUES (:kundennummer,sysdate,:selectedOption)",
        [einzelneInformationen[0].USERID,einzelneInformationen[0].selectedOption ]
      )
      
  
      var ort =  'null';
      var plz = 0;
      var strasse =  'null';
      var hausnummer = 0;
  
  
      //Check if Adresse schon vorhanden
      result4 = await conn.execute('SELECT * FROM ADRESSE WHERE STRASSE = :strasse AND POSTLEITZAHL = :plz AND HAUSNUMMER = :hnr AND ORT = :ort',[strasse,plz,hausnummer,ort])
      
      if(result4.rows.length > 0){
        conn.execute('UPDATE ADRESSE SET ISTRECHNUNGSADRESSE=1, ISTLIEFERADRESSE=1')
      }else{
        conn.execute("INSERT INTO ADRESSE (STRASSE,POSTLEITZAHL,HAUSNUMMER,ORT,ISTWOHNADRESSE, ISTRECHNUNGSADRESSE, ISTLIEFERADRESSE, ISTSTANDORTSADRESSE) VALUES (:strasse,:plz,:hausnummer,:ort,0,1,1,0)",
        [strasse,plz,hausnummer,ort])
      }
  
      const result3 = await conn.execute(
        "INSERT INTO KUNDE_HAT_ADRESSE (KUNDENNUMMER,STRASSE,POSTLEITZAHL,HAUSNUMMER,ORT) VALUES (:neuesteKundennummer,:strasse,:plz,:hausnummer,:ort)",
        [einzelneInformationen[0].USERID,strasse,plz,hausnummer,ort]
      )

      const hatBestellung = await conn.execute("select KUNDENNUMMER from BESTELLUNG where Kundennummer = :userID",[einzelneInformationen[0].USERID])

      if (hatBestellung.rows.length === 0) {
        await conn.execute('INSERT INTO BESTELLUNG(KUNDENNUMMER, ZEITSTEMPEL) VALUES (:userID,sysdate)', [einzelneInformationen[0].USERID]);
      }

      for (const fleachenInformationen of einzelneInformationen) {


        fleachenInformationen.USERID = einzelneInformationen[0].USERID

        console.log(fleachenInformationen.USERID + ' fleachenInformationen.USERID')

    
        if(fleachenInformationen.productid === 'undefinedundefinedundefined'){
          let result = await conn.execute('select max(ARTIKELNR) from PRODUKT where Kundennummer = :userID', [fleachenInformationen.USERID]);
          fleachenInformationen.productid = result.rows[0][0];
          
          if(fleachenInformationen.productid === null){
            fleachenInformationen.productid = 0;
          }
          
          console.log(fleachenInformationen.productid + ' fleachenInformationen.productid')
          fleachenInformationen.productid = '' + fleachenInformationen.USERID + '' + (fleachenInformationen.productid + 1) + '';

          
        }

        console.log(fleachenInformationen.productid + ' fleachenInformationen.productid')



        await conn.execute("insert into PRODUKT (ARTIKELNR,FLÄCHENNAME,preis,FOTO,FLEACHENART,Kundennummer) VALUES (:productID,:flaechenname,7,:imageElement,:fleachenartValue,:userID)",[fleachenInformationen.productid,fleachenInformationen.flaechenname,fleachenInformationen.imageElement,fleachenInformationen.fleachenart,fleachenInformationen.USERID])
        await conn.execute("insert into PRODUKT_ENTHÄLT_TIEFE(ARTIKELNR, TIEFENID) VALUES (:productID,:gettiefenValue)",[fleachenInformationen.productid,fleachenInformationen.tiefenValue])

        if(fleachenInformationen.MangatValue=='j'){
          await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[fleachenInformationen.productid])
        } 
        
        if(fleachenInformationen.EminValue=='j'){
          await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,1,1)",[fleachenInformationen.productid])
        }
    
        if(fleachenInformationen.StickstoffValue==2){
          await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,2,1)",[fleachenInformationen.productid])
        } else if(fleachenInformationen.StickstoffValue==3){
          await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,3,1)",[fleachenInformationen.productid])
        } else if(fleachenInformationen.StickstoffValue==4){
          await conn.execute("insert into PRODUKT_ENTHÄLT_PROBE(ArtikelNr, PROBENARTID,PROBENSTATUS)  values (:productID,4,1)",[fleachenInformationen.productid])
        }
                
        for (let j = 0; j <= fleachenInformationen.coordinates.length; j++) {
          try{
            var position = j+1;  
            await conn.execute(
              "insert into FLEACHENKOORDINATE(FKOORDINATENIDLAT, FKOORDINATENIDLNG, ARTIKELNR,POSITIONSPUNKT) VALUES (:coordinateLAT, :coordinateLNG, :productID, :position)",
              {coordinateLAT: fleachenInformationen.coordinates[j][0], coordinateLNG: fleachenInformationen.coordinates[j][1], productID: fleachenInformationen.productid, position}
            );
          } catch (error) {
            break;
          }
        }

        await conn.execute('INSERT INTO BESTELLUNG_ENTHÄLT_PRODUKT (KUNDENNUMMER,ARTIKELNR) VALUES(:userID,:productID)',[fleachenInformationen.USERID,fleachenInformationen.productid])
      }
    }
    
    conn.commit()

    //TODO GHET ES VOLLKOMMEN DURCH BZW WARUM NICHT
  } catch (err) {
    console.log('Ouch!', err)
    return 123;
    //return res.status(123).send('Es wurden keine ZIP-Dateien hochgeladen.');
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

async function getkundenDatenVomAusgewaehltenUser(userID){
  try {
    conn = await oracledb.getConnection(config)

    const result =  await conn.execute(`
    SELECT
        Kunde.KUNDENNUMMER,
        Kunde.VORNAME,
        Kunde.NACHNAME,
        Kunde.E_MAIL,
        Kunde.TELEFONNUMMER,
        KUNDE.GEBURTSDATUM,
        KUNDE.PASSWORD,
        Adresse.ORT,
        Adresse.POSTLEITZAHL,
        Adresse.STRASSE,
        Adresse.HAUSNUMMER
        FROM
            Kunde
        JOIN
            Kunde_Hat_Adresse ON Kunde.KUNDENNUMMER = Kunde_Hat_Adresse.KUNDENNUMMER
        JOIN
            Adresse ON Kunde_Hat_Adresse.STRASSE = Adresse.STRASSE
            AND Kunde_Hat_Adresse.ORT = Adresse.ORT
            AND Kunde_Hat_Adresse.POSTLEITZAHL = Adresse.POSTLEITZAHL
            AND Kunde_Hat_Adresse.HAUSNUMMER = Adresse.HAUSNUMMER
        where KUNDE.KUNDENNUMMER = :userID`,[userID])
    
  
    return result.rows
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}



async function getUpdateDatenVomKunden(kundennummer, vorname,nachname,email,telefonnummer,ort,plz,strasse,hausnummer,password,geburtsdatum){
  try {
    conn = await oracledb.getConnection(config)


    console.log(kundennummer,vorname)

    const result = await conn.execute(`select * from KUNDE where  KUNDENNUMMER = :kundennummer`, [kundennummer])

    console.log(result.rows + 'ist das ergebnis')


    const result2 = await conn.execute("update KUNDE set VORNAME = :vorname, NACHNAME = :nachname, TELEFONNUMMER = :telefonnummer, E_MAIL = :email, PASSWORD = :password, GEBURTSDATUM = TO_DATE(:geburtsdatum,'yyyy-mm-dd') where KUNDENNUMMER = :kundennummer", [vorname,nachname,telefonnummer,email,password,geburtsdatum,kundennummer])
  
    try {
      const result3 = await conn.execute("insert into ADRESSE (STRASSE, POSTLEITZAHL, HAUSNUMMER, ORT) VALUES (:strasse,:plz,:hausnummer,:ort)",[strasse,plz,hausnummer,ort])

    } catch(err){}

    //
    
    const result4 = await conn.execute("delete from KUNDE_HAT_ADRESSE where KUNDENNUMMER = :kundennummer",[kundennummer])
    const result5 = await conn.execute("insert into KUNDE_HAT_ADRESSE(KUNDENNUMMER, STRASSE, POSTLEITZAHL, HAUSNUMMER, ORT) VALUES (:kundennummer,:strasse,:plz,:hausnummer,:ort)",[kundennummer,strasse,plz,hausnummer,ort])

    conn.commit()
  } catch (err) {
    console.log('Ouch!', err)
  } finally {
    if (conn) { // conn assignment worked, need to close
      await conn.close()
    }
  }
}

module.exports = {
  getResultKategorien,
  getResultLast,
  getResultPreis,
  getBestseller,
  getAllProducts,
  getProductsByCategory,
  getProductDetails,
  registerUser,
  registerUserWithFleachen,
  getUserByEmail,
  getAllOberCategories,
  getUserById,
  createCart,
  createBestellung,
  putToCart,
  putToBestellung,
  anderPasswort,
  getCartFromUser,
  getfleachenFromAllUser,
  getfleachenFromUser,
  getFleachenFromUserBestellt,
  getBestllungenFromUser,
  getKundendaten,
  getMitarbeiterdaten,
  deleteFromCart,
  initiateOrder,
  initiateOrderNew,
  getClob,
  getClobWaren,
  getSuggestions,
  getCartSuggestions,
  getCategorys,
  getInformationsForGenerateKmlFile, 
  mehrereKundenHochladen,
  fleacheAufBearbeitetSetzen,
  getaufBearbeitenStellen,
  beiEinemKundenDieFleachenHinzufügen,
  beiMehrerenKundenDieFleachenHinzufügen,
  getKundendatenDieZuZiehenSind,
  getkundenDatenVomAusgewaehltenUser,
  getUpdateDatenVomKunden
}