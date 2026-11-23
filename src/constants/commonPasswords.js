// Mots de passe parmi les plus utilisés et les plus présents dans les fuites de données (8 caractères et plus).
// La norme NIST demande de refuser ce type de mot de passe.
export const COMMON_PASSWORDS = new Set([
    '12345678', '123456789', '1234567890', '12345678910', '87654321', '11111111', '00000000',
    '88888888', '11223344', '12341234', '12121212', '123123123', '1q2w3e4r', '1q2w3e4r5t',
    '1qaz2wsx', 'qwertyui', 'qwertyuiop', 'qwerty123', 'qwerty1234', 'azertyui', 'azertyuiop',
    'azerty123', 'azerty1234', 'abcd1234', 'abc12345', 'abcdefgh', 'aaaaaaaa', 'asdfghjk',
    'zxcvbnm1', 'password', 'password1', 'password12', 'password123', 'passw0rd', 'p@ssw0rd',
    'p@ssword', 'motdepasse', 'motdepasse1', 'motdepasse123', 'iloveyou', 'iloveyou1',
    'jetaime1', 'jetaime123', 'sunshine', 'princess', 'football', 'football1', 'baseball',
    'superman', 'starwars', 'pokemon1', 'whatever', 'trustno1', 'welcome1', 'welcome123',
    'bienvenue', 'bienvenue1', 'letmein1', 'computer', 'internet', 'dragon123', 'monkey123',
    'master123', 'shadow123', 'michael1', 'jennifer', 'charlie1', 'liverpool', 'chelsea1',
    'arsenal1', 'marseille', 'doudou123', 'chouchou', 'soleil123', 'nicolas1', 'loulou123',
    'changeme', 'changeme1', 'secret123', 'admin123', 'administrator', 'root1234', 'test1234',
    'testtest', 'user1234', 'login123', 'qazwsxedc', 'zaq12wsx', 'q1w2e3r4', 'a1b2c3d4',
    'belgique', 'belgium1', 'bruxelles', 'namur123', 'henallux',
]);
