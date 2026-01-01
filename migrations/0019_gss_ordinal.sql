-- ABOUTME: Convert GSS questions to ordinal type with properly ordered options.
-- ABOUTME: Remaps human distribution keys to match new option ordering.

-- Questions with correct order - just change response_type:

-- Abortion: no < yes (already correct)
UPDATE questions SET response_type = 'ordinal' WHERE id = 'lzTswbsW8B0q';

-- Euthanasia doctor: no < yes (already correct)
UPDATE questions SET response_type = 'ordinal' WHERE id = '0SHeshdseghj';

-- Right to end life: no < yes (already correct)
UPDATE questions SET response_type = 'ordinal' WHERE id = '8TXki7xsOcCF';

-- Life after death: no < yes (already correct)
UPDATE questions SET response_type = 'ordinal' WHERE id = 'Z5gsiDJclSrr';

-- Evolution: false < true (already correct)
UPDATE questions SET response_type = 'ordinal' WHERE id = 'PEN3oM2qtwoR';

-- Trust: can't be careful < depends < can be trusted (already correct)
UPDATE questions SET response_type = 'ordinal' WHERE id = 'K3nYBVgo1wjq';

-- Questions needing reorder:

-- Death penalty: favor,oppose → oppose,favor (swap 1↔2)
UPDATE questions SET response_type = 'ordinal', options = '["oppose","favor"]' WHERE id = 'dHaIkEfJtuaw';
UPDATE human_response_distributions SET distribution =
    json_object('1', json_extract(distribution, '$.2'), '2', json_extract(distribution, '$.1'))
WHERE question_id = 'dHaIkEfJtuaw';

-- Marijuana: should be legal, should not be legal → should not be legal, should be legal (swap 1↔2)
UPDATE questions SET response_type = 'ordinal', options = '["should not be legal","should be legal"]' WHERE id = '9xD22wf7D8p4';
UPDATE human_response_distributions SET distribution =
    json_object('1', json_extract(distribution, '$.2'), '2', json_extract(distribution, '$.1'))
WHERE question_id = '9xD22wf7D8p4';

-- Take advantage: depends,would take advantage,would try to be fair → would take advantage,depends,would try to be fair
-- Old: 1=depends, 2=take advantage, 3=fair → New: 1=take advantage, 2=depends, 3=fair
UPDATE questions SET response_type = 'ordinal', options = '["would take advantage of you","depends","would try to be fair"]' WHERE id = 'S0ZMTPF0RuNU';
UPDATE human_response_distributions SET distribution =
    json_object('1', json_extract(distribution, '$.2'), '2', json_extract(distribution, '$.1'), '3', json_extract(distribution, '$.3'))
WHERE question_id = 'S0ZMTPF0RuNU';

-- Helpful: depends,looking out,try to be helpful → looking out,depends,try to be helpful
-- Old: 1=depends, 2=looking out, 3=helpful → New: 1=looking out, 2=depends, 3=helpful
UPDATE questions SET response_type = 'ordinal', options = '["looking out for themselves","depends","try to be helpful"]' WHERE id = 'vHpHJmo0eNrg';
UPDATE human_response_distributions SET distribution =
    json_object('1', json_extract(distribution, '$.2'), '2', json_extract(distribution, '$.1'), '3', json_extract(distribution, '$.3'))
WHERE question_id = 'vHpHJmo0eNrg';

-- Premarital sex: almost always wrong,always wrong,not wrong at all,wrong only sometimes
-- → always wrong,almost always wrong,wrong only sometimes,not wrong at all
-- Old: 1=almost always, 2=always, 3=not wrong, 4=sometimes
-- New: 1=always, 2=almost always, 3=sometimes, 4=not wrong
UPDATE questions SET response_type = 'ordinal', options = '["always wrong","almost always wrong","wrong only sometimes","not wrong at all"]' WHERE id = 'DBn7yrtUTJuG';
UPDATE human_response_distributions SET distribution =
    json_object('1', json_extract(distribution, '$.2'), '2', json_extract(distribution, '$.1'), '3', json_extract(distribution, '$.4'), '4', json_extract(distribution, '$.3'))
WHERE question_id = 'DBn7yrtUTJuG';

-- Same-sex: almost always wrong,always wrong,not wrong at all,other,wrong only sometimes
-- → always wrong,almost always wrong,wrong only sometimes,not wrong at all (dropping "other")
-- Old: 1=almost always, 2=always, 3=not wrong, 4=other, 5=sometimes
-- New: 1=always, 2=almost always, 3=sometimes, 4=not wrong
UPDATE questions SET response_type = 'ordinal', options = '["always wrong","almost always wrong","wrong only sometimes","not wrong at all"]' WHERE id = 'eH4aluda0upg';
UPDATE human_response_distributions SET distribution =
    json_object('1', json_extract(distribution, '$.2'), '2', json_extract(distribution, '$.1'), '3', json_extract(distribution, '$.5'), '4', json_extract(distribution, '$.3'))
WHERE question_id = 'eH4aluda0upg';

-- Belief in God: believe sometimes,believe with doubts,don't believe,higher power,no doubts
-- → don't believe,higher power,believe sometimes,believe with doubts,no doubts
-- Old: 1=believe sometimes, 2=believe with doubts, 3=don't believe, 4=higher power, 5=no doubts
-- New: 1=don't believe, 2=higher power, 3=believe sometimes, 4=believe with doubts, 5=no doubts
UPDATE questions SET response_type = 'ordinal', options = '["don''t believe","higher power","believe sometimes","believe with doubts","no doubts"]' WHERE id = 'mp1RnsSZtkgy';
UPDATE human_response_distributions SET distribution =
    json_object('1', json_extract(distribution, '$.3'), '2', json_extract(distribution, '$.4'), '3', json_extract(distribution, '$.1'), '4', json_extract(distribution, '$.2'), '5', json_extract(distribution, '$.5'))
WHERE question_id = 'mp1RnsSZtkgy';

-- Liberal-conservative: conservative,extremely conservative,extremely liberal,liberal,moderate,slightly conservative,slightly liberal
-- → extremely liberal,liberal,slightly liberal,moderate,slightly conservative,conservative,extremely conservative
-- Old: 1=conservative, 2=extremely conservative, 3=extremely liberal, 4=liberal, 5=moderate, 6=slightly conservative, 7=slightly liberal
-- New: 1=extremely liberal, 2=liberal, 3=slightly liberal, 4=moderate, 5=slightly conservative, 6=conservative, 7=extremely conservative
UPDATE questions SET response_type = 'ordinal', options = '["extremely liberal","liberal","slightly liberal","moderate, middle of the road","slightly conservative","conservative","extremely conservative"]' WHERE id = 'PZ5s0TcIaSL3';
UPDATE human_response_distributions SET distribution =
    json_object('1', json_extract(distribution, '$.3'), '2', json_extract(distribution, '$.4'), '3', json_extract(distribution, '$.7'), '4', json_extract(distribution, '$.5'), '5', json_extract(distribution, '$.6'), '6', json_extract(distribution, '$.1'), '7', json_extract(distribution, '$.2'))
WHERE question_id = 'PZ5s0TcIaSL3';

-- Party ID: independent (neither),ind close dem,ind close rep,not very strong dem,not very strong rep,other party,strong dem,strong rep
-- → strong dem,not very strong dem,ind close dem,independent,ind close rep,not very strong rep,strong rep (dropping "other party")
-- Old: 1=ind neither, 2=ind close dem, 3=ind close rep, 4=not very strong dem, 5=not very strong rep, 6=other party, 7=strong dem, 8=strong rep
-- New: 1=strong dem, 2=not very strong dem, 3=ind close dem, 4=ind neither, 5=ind close rep, 6=not very strong rep, 7=strong rep
UPDATE questions SET response_type = 'ordinal', options = '["strong democrat","not very strong democrat","independent, close to democrat","independent (neither, no response)","independent, close to republican","not very strong republican","strong republican"]' WHERE id = 'kcV5biAbj7bP';
UPDATE human_response_distributions SET distribution =
    json_object('1', json_extract(distribution, '$.7'), '2', json_extract(distribution, '$.4'), '3', json_extract(distribution, '$.2'), '4', json_extract(distribution, '$.1'), '5', json_extract(distribution, '$.3'), '6', json_extract(distribution, '$.5'), '7', json_extract(distribution, '$.8'))
WHERE question_id = 'kcV5biAbj7bP';
