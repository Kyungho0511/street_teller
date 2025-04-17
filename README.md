# Street Teller - Site Selection web tool
The Street Teller is a web application integrated with a large language model (LLM) that provides a data-driven methodology for site down-selection. Users can sort urban data based on their preferences, and the application identifies target clusters that align with those interests. After users select the clusters they wish to target, the application recursively recommends more granular clusters within the initial selections. This iterative process allows for progressively refined site down-selection. [Click Here to test Street Teller](https://siteteller.netlify.app/) 
![site_teller_small](https://github.com/user-attachments/assets/630463c1-b97d-4f5d-8f4a-0338787c07ce)

## Decision Making Process in down-selecting clusters
The application utilizes the OpenAI API to assign meaningful labels and interpretations to each cluster generated by the machine learning (ML) clustering algorithm. The LLM translates the numeric results of the clustering analysis into human-readable language. Human decision-makers are then expected to review and select the clusters identified by the LLM. This iterative exchange between the user and the LLM enables precise targeting.
<img width="600" alt="diagram_LLM-human" src="https://github.com/user-attachments/assets/871c66ba-478b-41ac-b9ff-b1edf9c38de7" />

## Data Pipeline
The diagram below illustrates the process of preparing a database and developing an application to interact with it. Urban data has been collected from the open sources listed above and geoprocessed using Census Tract boundaries. As of April 2025, the backend of the application is still under development.
<img width="600" alt="diagram_architecture" src="https://github.com/user-attachments/assets/70ef5595-f0a1-4bd8-b457-8c701b012393" />

## Data Source
- [State of New York | Open Data](https://data.ny.gov/)
- [Census Bureau](https://www.census.gov/)
