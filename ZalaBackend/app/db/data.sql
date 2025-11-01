INSERT INTO contacts (contact_id, first_name, last_name, email, phone)
    VALUES
    (1, 'Robert', 'Huang', 'rh5661@rit.edu', '1-234-567-8910'),
    (2, 'Colin', 'Tandreau', 'colintan@rit.edu', '1-224-567-8910'),
    (3, 'Jonathan', 'Zhu', 'jonzhu@rit.edu', '1-233-567-8910')
;

INSERT INTO addresses (address_id, street_1, street_2, city, state, zipcode)
    VALUES
    (1, '1 Lomb Memorial Dr', NULL, 'Rochester', 'NY', 14623),
    (2, '300 Park Point Dr', NULL, 'Rochester', 'NY', 14623),
    (3, '500 Park Point Dr', NULL, 'Rochester', 'NY', 14623),
    (4, '600 Park Point Dr', NULL, 'Rochester', 'NY', 14623)
;

INSERT INTO users (user_id, contact_id, username, role, profile_pic, xp, created_at, updated_at)
    VALUES
    (1, 1, 'admin', 'admin', '', 67, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 2, 'user1', 'user', '', 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
;

INSERT INTO leads (lead_id, created_by, contact_id, address_id, person_type, business, website, license_num, notes)
    VALUES
    (1, 1, 3, 3, 'Agent', 'American Campus LLC', 'americancampus.com', 'ABC123456', 'some notes')
;

INSERT INTO properties (property_id, property_name, address_id, mls_number)
    VALUES
    (1, 'Park Point 600', 4, 'MLS12345'),
    (2, 'RIT CAMPUS', 1, 'MLS2312345')
;

INSERT INTO units (unit_id, property_id, apt_num, bedrooms, bath, sqft, notes)
    VALUES
    (1, 1, 'Unit 2', 4, 2, 500, 'more notes'),
    (2, 2, 'Eastman', 0, 5, 1000, 'rit notes')
;

INSERT INTO user_properties (user_id, property_id)
    VALUES
    (1, 2)
;

INSERT INTO lead_properties (lead_id, property_id)
    VALUES
    (1, 1)
;

INSERT INTO user_authentication (user_id, password_hash)
    VALUES
    (1, 'replaceHash'),
    (2, 'replaceMe')
;