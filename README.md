# AndroidEventsApplications

Nume: Lupean Horatiu-Stefan
Grupa: 234

EventSimple - contine aplicatia nativa
EventReact  - contine aplicatia folosind react

- aplicatia o sa fie o aplicatie pentru evenimente (concerte, specacole, etc.)
- vor exista 2 tipuri de utilizatori:
    * Participant:
        - va putea sa vada toata lista de evenimente (la care are acces)
        - va putea sa se inscrie la un eveniment (daca mai sunt locuri disponibile)
    
    * Organizator:
        - aceleasi drepturi ca si un Participant
        - poate adauga evenimente
        - poate sterge un eveniment creeat de el
        - poate modifica un eveniment creeat de el
        
        
- vor exista 2 entitati (principale):
    * User:
        - username:     identificator unic
        - name:         nume + prenume
        - mail:         mailul cu care s-a inregistrat
        - password:     hash-ul parolei
        - bithDate:     data nasteri
        - city:         orasul curent (orasul implicit pentru cautare)
        - isOrganizer:  valoare care indica daca userul este organizator

    * Event:
        - id:           identificator unic
        - name:         numele evenimentului
        - date:         data, ora si minutul de incepere a evenimentului
        - minAge:       varsta minima de participare (un eveniment va aparea in lista doar daca utilizatorul are varta minima implinita la data evenimentului)
        - city:         orasul in care se va desfasura evenimentul
        - address:      adresa exacta
        - maxCapacity:  capacitatea maxima
        - idOrganizer:  id-ul organizatorului care a creeat evenimentul (doar el il va putea modifica / sterge)